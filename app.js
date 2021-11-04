$(document).ready(() => {
  let contacts = [];
  let foundContacts = [];
  let isSearchEmpty = true;

  function addContacts(name, surname, phone, address) {
    if (name && surname && phone && address) {
      contacts.push({
        id: Math.floor(Math.random() * 10000).toString(),
        name,
        surname,
        phone,
        address,
      });
    } else {
      window.alert("Please fill up all fields");
    }
    clearInput();
  }
//Found this very helpful implementation to clear inputfrom stackoverflow:
https://stackoverflow.com/questions/3786694/how-to-reset-clear-form-through-javascript
//I since it's to clear the input after adding contact I created a function and called it at the end of the add contact function.
  function clearInput() {
    $(".input-form")[0].reset();
  }

  function removeContact(id) {
    let allContacts = getContacts();
    if (allContacts === foundContacts) {
      let foundContactIndex = contacts.findIndex(
        (contact) => contact.id === id
      );
      if (foundContactIndex > -1) {
        contacts.splice(foundContactIndex, 1);
      }
    }
    let foundContactIndex = allContacts.findIndex(
      (contact) => contact.id === id
    );
    if (foundContactIndex > -1) {
      allContacts.splice(foundContactIndex, 1);
    }
    clearInput();
  }

  function search(query) {
    query = query.toLowerCase();
    foundContacts = contacts
      .filter(
        (contact) =>
          contact.name.toLowerCase().includes(query) ||
          contact.surname.toLowerCase().includes(query) ||
          contact.address.toLowerCase().includes(query) ||
          contact.phone.toLowerCase().includes(query)
      )
      //this implementation of 'spread' for this case was something a good firend of mine, Paul McCloud, who works ar ResearchGate, shared with me when wwe met to nerd out and he was teaching me some tools. 
      .map((contact) => {
        return {
          ...contact,
          foundIndexes: {
            name: contact.name.toLowerCase().indexOf(query),
            surname: contact.surname.toLowerCase().indexOf(query),
            phone: contact.phone.toLowerCase().indexOf(query),
            address: contact.address.toLowerCase().indexOf(query),
          },
        };
      });
    if (query.length === 0) {
      isSearchEmpty = true;
      foundContacts = [];
    } else {
      isSearchEmpty = false;
    }
  }
//this concept of the "refresh contact view" a good friend of mine, Atharva Johri, working at Klarna, showed me went he was teaching me some JQuery.
  function refreshContactView() {
    const allContacts = getContacts();
    const contactViewTemplate = `
      <div class="contact-container" data-id="contact-id">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Surname</th>
            <th>Phone</th>
            <th>Address</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>contact-name</td>
            <td>contact-surname</td>
            <td>contact-phone</td>
            <td>contact-address</td>
            <td><button class="remove-contacts button">x</button></td>
          </tr>
        </tbody>
       </table>
       </div>
      `;
    $("#contacts").empty();
    const allContactsHtml = allContacts.reduce((prev, contact) => {
      let contactHtml = contactViewTemplate;
      if (isSearchEmpty) {
        contactHtml = contactHtml
          .replace(/contact-name/, contact.name)
          .replace(/contact-surname/, contact.surname)
          .replace(/contact-phone/, contact.phone)
          .replace(/contact-address/, contact.address)
          .replace(/contact-id/, contact.id);
      } else {
        const query = $("#search-input").val();
        contactHtml = contactHtml
          .replace(/contact-name/, getHighlightedField(contact, "name", query))
          .replace(
            /contact-surname/,
            getHighlightedField(contact, "surname", query)
          )
          .replace(
            /contact-phone/,
            getHighlightedField(contact, "phone", query)
          )
          .replace(
            /contact-address/,
            getHighlightedField(contact, "address", query)
          )
          .replace(/contact-id/, contact.id);
      }
      //this video was really helpful in showing a bit how the highlighting of a match could work. https://www.youtube.com/watch?v=Ixt6k9aatPQ
      //I didn't use regExp like they did since I was using an array of objects, it made more sense to me to do it like this.
      function getHighlightedField(foundContact, fieldName, query) {
        if (foundContact.foundIndexes[fieldName] === -1) {
          return foundContact[fieldName];
        }
        let foundIndex = foundContact.foundIndexes[fieldName];
        const front = foundContact[fieldName].slice(0, foundIndex);
        const highlighted = `<span style="background-color: yellow">${foundContact[
          fieldName
        ].slice(foundIndex, foundIndex + query.length)}</span>`;
        const back = foundContact[fieldName].slice(foundIndex + query.length);
        return front + highlighted + back;
      }
      console.log(prev + contactHtml)
      return prev + contactHtml;
    }, "");

    $("#contacts").append(allContactsHtml);
    setEventHandler();
  }
//I saw the preventDefault being implemented in a video tutorial, then I researched a bit more on stackoverflow: https://stackoverflow.com/questions/19454310/stop-form-refreshing-page-on-submit
// This is the video: https://youtu.be/7Yigdj6lEXk
//I also got the idea for the linear-gradient from there.
  $("#add-button").click((e) => {
    e.preventDefault();
    addContacts(
      $("#input-name").val(),
      $("#input-surname").val(),
      $("#input-phone").val(),
      $("#input-address").val()
    );
    refreshContactView();
  });

  function setEventHandler() {
    $(".remove-contacts").click(function () {
      removeContact($(this).closest(".contact-container").attr("data-id"));
      refreshContactView();
    });
  }
  const getContacts = () => (isSearchEmpty ? contacts : foundContacts);

//this post was really helpful on understanding what to use, between keyup, keydown, keypress or input:
https://stackoverflow.com/questions/38502560/whats-the-difference-between-keyup-keydown-keypress-and-input-events
  $("#search-input").on("input", function () {
    search($(this).val());
    refreshContactView();
  });
});
