$(document).ready(function () {
  $(".profil_module_btn").click(function () {
    const gender = $("#gender").val();
    const username = $("#username").val();
    const id = 1;
    const user = {
      username,
      gender
    };
    toggleProfilBtn();
    saveIndexedDB(id, user, 'users');
  })


  window.addEventListener('load', () => {
    loadIndexedDB(1, callBackData);
    loadNotesIndexedDB(callBackNotes)
  })

  const toggleProfilBtn = () => {
    $('.user_info').addClass('visible');
    $('.add_profile_btn').addClass('hidden');
    $(".profile_module_btn_close").click();
    $("#username").val(' ');
  }

  $('.add_new_note').click(() => {
    let dateForDateTimeLocal = dateFormat();
    $('.noteTime').val(dateForDateTimeLocal);
    $('.alarmClock').val(dateForDateTimeLocal);
    $(".new_note_container").addClass('activ');
  })

  $(".note_close").click(() => {
    if ($(".new_note_container").hasClass("activ")) {
      $(".new_note_container").removeClass('activ');
    } else {
      return;
    }
  })

  $('.alarmCheckbox').click(() => {
    if ($(".alarmCheckbox").is(":checked")) {
      $(".alarmClock").addClass("activAlarm");
    } else {
      $(".alarmClock").removeClass("activAlarm");
    }
  })

  let callBackData = (fileData) => {
    if (fileData.gender != null && fileData.username != null) {
      addValue('.profil_gender', '.profil_name_user', fileData.gender, fileData.username, '.user_info');
      toggleProfilBtn();
    } else {
      return;
    }
  }


  const dateFormat = () => {
    let currentDate = new Date();
    return currentDate.getFullYear() +
      "-" + (((currentDate.getMonth()) + 1) < 10 ? '0' : '') + ((currentDate.getMonth()) + 1) +
      "-" + (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate() +
      "T" + (currentDate.getHours() < 10 ? '0' : '') + currentDate.getHours() +
      ":" + (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes() +
      ":" + (currentDate.getSeconds() < 10 ? '0' : '') + currentDate.getSeconds();
  }

  let playSound = () => {
    const audio = new Audio("./audio/bells.mp3");
    audio.play();
    audio.play();
  }

  let callBackNotes = (note) => {
    const notes = [];
    notes.push(note)
    notes.forEach(el => {
      $(".note_empty").addClass("note_activ");
      let dateForDateTimeLocal = dateFormat();
      let alarmColor;
      if (el.alarm != null && dateForDateTimeLocal < el.alarm) {
        alarmColor = "#fff";
      } else if (el.alarm != null && dateForDateTimeLocal >= el.alarm) {
        alarmColor = "#ff1c1c";
        playSound();
      } else {
        alarmColor = "#fff";
      }
      $(".add_note_container").append(appendHtml(el.noteBackColor, el.noteTextColor,
        el.note, el.projectType, el.time, el.id, el.alarm, alarmColor))
    })
  }

  let addValue = (classNameGender, classNameUser, gender, username, parentClass) => {
    $('.user_info').addClass('visible');
    $('.add_profile_btn').addClass('hidden');
    if (gender == "Male") {
      $(classNameGender).text('Hello  Mr.')
      $(parentClass).addClass('gender_male');
    } else if (gender == "Female") {
      $(classNameGender).text('Hello  Mrs.');
      $(parentClass).addClass('gender_female');
    } else {
      $(classNameGender).text('Hello ');
      $(parentClass).addClass('gender_other');
    }
    $(classNameUser).text(username)
  }


  const openIndexedDB = (fileindex) => {
    const indexedDB = window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB ||
      window.shimIndexedDB;

    const openDB = indexedDB.open("DailyNoteDb", 1);

    openDB.onupgradeneeded = function () {
      const db = {}
      db.result = openDB.result;
      db.store = db.result.createObjectStore("user_store", {
        keyPath: "id"
      });
      if (fileindex) db.index = db.store.createIndex("users", fileindex);
    };
    return openDB;
  }

  const getStoreIndexedDB = (openDB) => {
    const db = {};
    db.result = openDB.result;
    db.tx = db.result.transaction("user_store", "readwrite");
    db.store = db.tx.objectStore("user_store");
    return db;
  }

  const saveIndexedDB = (filename, filedata, fileindex) => {
    const openDB = openIndexedDB(fileindex);

    openDB.onsuccess = () => {
      const db = getStoreIndexedDB(openDB);

      db.store.put({
        id: filename,
        data: filedata
      });
    }

    return true;
  }

  const loadIndexedDB = (filename, callback) => {
    const openDB = openIndexedDB();
    openDB.onsuccess = () => {
      const db = getStoreIndexedDB(openDB);

      const getData = db.store.get(filename);
      getData.onsuccess = () => {
        callback(getData.result.data);
      };

      db.tx.oncomplete = () => {
        db.result.close();
      };
    }

    return true;
  }



  $(".note_add").click(() => {
    $(".note_empty").addClass("note_activ");
    let checkDate = new Date($(".noteTime").val());
    let time = findDate(checkDate);
    let note = $("#noteBody").val();
    let id = Math.random();
    let noteBackColor = $(".note_back_color").val();
    let noteTextColor = $(".note_text_color").val();
    let alarm;
    if ($(".alarmCheckbox").is(":checked")) {
      alarm = $(".alarmClock").val();
    } else {
      alarm = null;
    }
    let projectType;
    if ($("#business").is(":checked")) {
      projectType = $("#business").val();
    } else {
      projectType = $("#personal").val();
    }
    $(".new_note_container").removeClass('activ');
    let data = {
      id,
      time,
      note,
      noteBackColor,
      noteTextColor,
      projectType,
      alarm
    }
    saveNotes(data);
    $(".add_note_container").append(appendHtml(noteBackColor, noteTextColor, note, projectType, time, id, alarm, "#fff"))
    resetInput();
  })

  let appendHtml = (backColor, textColor, note, projectType, time, id, alarm, alarmColor) => {
    let htmlData;
    if (alarm != null) {
      htmlData = `<img src="./images/alarm.png" alt="alarm.icon">${projectType}`;
    } else {
      htmlData = `${projectType}`;
    }
    let html = `<div class="main_menu_card" id=${id} style="background-color:${backColor}!important;border:3px solid ${alarmColor} !important">
        <div><small>${time}</small></div>
          <div class="main_menu_note" style="color:${textColor}!important">${note}</div>
           <div>
           <small class="note_project_type">${htmlData}</small>
           </div>
          <div class="main_note_remove">
          <button type="button" class="close remove_note" aria-label="Close">
          <span aria-hidden="true">&times;</span>
          </button>
         </div>
         <button type="button" class="noteDetail"><img src="./images/eye.png"/></button>
      </div>`
    return html;
  }

  $('.search_btn').click(function () {
    const value = $('.searchnote').val();
    const db = openNoteDb();
    db.transaction('r', db.notes, function () {
      db.notes.orderBy('note').filter(({
        note
      }) => note.includes(value, 1)).toArray().then(function (values) {
        $(".add_note_container").children().remove();
        values.forEach(value => {
          $(".add_note_container").append(appendHtml(value.noteBackColor, value.noteTextColor, value.note,
            value.projectType,
            value.time, value.id, value.alarm, "#fff"));
        })
      })
    })
  })

  $(document).on("click", '.noteDetail', function () {
    $(this).parent().toggleClass('main_detail')
    $(this).parent().find('.main_menu_note').toggleClass('main_detail_note')
  })

  $(document).on('click', ".projectType", function () {
    const value = $(this).attr("id");
    getProjectTypeFilter(value);
  })

  const getProjectTypeFilter = (data) => {
    const db = openNoteDb();
    db.transaction('r', db.notes, function () {
      if (data != "All") {
        db.notes.orderBy('projectType').filter(({
          projectType
        }) => projectType == data).toArray().then(function (values) {
          $(".add_note_container").children().remove();
          values.forEach(value => {
            $(".add_note_container").append(appendHtml(value.noteBackColor, value.noteTextColor, value.note,
              value.projectType,
              value.time, value.id, value.alarm, "#fff"));
          })
        })
      } else {
        db.notes.toArray().then(function (values) {
          $(".add_note_container").children().remove();
          values.forEach(value => {
            $(".add_note_container").append(appendHtml(value.noteBackColor, value.noteTextColor, value.note,
              value.projectType,
              value.time, value.id, value.alarm, "#fff"));
          })
        })
      }
    });
  }

  let findDate = (date) => {
    let currentDate = date;
    return currentDate.getFullYear() +
      "." + (((currentDate.getMonth()) + 1) < 10 ? '0' : '') + ((currentDate.getMonth()) + 1) +
      "." + (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate() +
      " " + (currentDate.getHours() < 10 ? '0' : '') + currentDate.getHours() +
      ":" + (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes() +
      ":" + (currentDate.getSeconds() < 10 ? '0' : '') + currentDate.getSeconds();
  }

  let resetInput = () => {
    $(".noteTime").val(' ');
    $("#noteBody").val('');
    $(".note_back_color").val('');
    $(".note_text_color").val('');
  }


  const openNoteDb = () => {
    const db = new Dexie("NotesDB");

    db.version(1).stores({
      notes: `
      id,
      time,
      note,
      noteBackColor,
      noteTextColor,
      projectType,
      alarm`,
    })

    return db;
  }

  const saveNotes = (data) => {
    const db = openNoteDb();

    db.transaction('rw', db.notes, function () {
      db.notes.add(data);
    }).catch(function (err) {
      console.log(err);
    })

  }

  const loadNotesIndexedDB = (callback) => {
    const db = openNoteDb();
    db.transaction('rw', db.notes, function () {
      db.notes.each(notes => callback(notes))
    }).catch(function (err) {
      console.log(err);
    })
  }

  const deleteOneNote = (id) => {
    const db = openNoteDb();
    db.notes.where('id').equals(id).delete();
  }

  $(document).on("click", ".remove_note", function () {

    const id = $(this).parent().parent().attr("id");
    const db = openNoteDb();
    db.notes.where('id').above(-1).modify(result => {
      if (result.id == id) {
        deleteOneNote(result.id);
        window.location.reload(true)
      }
    })
  })



});