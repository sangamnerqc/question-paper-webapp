const SCRIPT_URL = "https://script.google.com/a/macros/sangamnercollege.edu.in/s/AKfycbwltB6AJmzxEL1cegymeGpmwiYtoq8CEQtmjXkiddg3igd62TlMa6DmXiaRWEJxk3A5/exec";

let selectedQuestions = [];

/***************************************
 * LOAD QUESTIONS
 ***************************************/
function loadQuestions() {
  const payload = {
    action: "getQuestions",
    className: document.getElementById("className").value,
    courseCode: document.getElementById("courseCode").value,
    marks: document.getElementById("marks").value
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => renderQuestions(data));
}

/***************************************
 * RENDER QUESTIONS
 ***************************************/
function renderQuestions(questions) {
  const div = document.getElementById("questionList");
  div.innerHTML = "";

  questions.forEach(q => {
    const block = document.createElement("div");
    block.className = "question";
    block.innerHTML = `
      <input type="checkbox" onchange="toggleQuestion(this, '${q.qid}', '${q.text}')">
      <b>${q.qid}</b> (Module ${q.module})
      <p>${q.text}</p>
    `;
    div.appendChild(block);
  });
}

/***************************************
 * SELECT QUESTIONS
 ***************************************/
function toggleQuestion(cb, qid, text) {
  if (cb.checked) {
    selectedQuestions.push({ qid, text, placeholder: qid });
  } else {
    selectedQuestions = selectedQuestions.filter(q => q.qid !== qid);
  }
}

/***************************************
 * PRINT PREVIEW
 ***************************************/
function previewPaper() {
  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "preview",
      selected: selectedQuestions,
      templateId: "<<<TEMPLATE_DOC_ID>>>"
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("previewBox").innerText = data.preview;
  });
}

/***************************************
 * CONFIRM & PRINT
 ***************************************/
function confirmAndPrint() {
  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "confirm",
      className: document.getElementById("className").value,
      courseCode: document.getElementById("courseCode").value,
      marks: document.getElementById("marks").value,
      setName: document.getElementById("setName").value,
      usedQIDs: selectedQuestions.map(q => q.qid),
      finalText: document.getElementById("previewBox").innerText,
      filename: "QuestionPaper"
    })
  })
  .then(res => res.json())
  .then(data => alert("PDF Generated Successfully"));
}
