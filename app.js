const SCRIPT_URL =
  "https://script.google.com/a/macros/sangamnercollege.edu.in/s/AKfycbwltB6AJmzxEL1cegymeGpmwiYtoq8CEQtmjXkiddg3igd62TlMa6DmXiaRWEJxk3A5/exec";

const TEMPLATE_ID = "PUT_REAL_TEMPLATE_DOC_ID_HERE";

let selectedQuestions = [];

/***************************************
 * COMMON FETCH WRAPPER
 ***************************************/
function postToScript(payload) {
  return fetch(SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).then(res => res.json());
}

/***************************************
 * LOAD QUESTIONS
 ***************************************/
function loadQuestions() {
  selectedQuestions = [];
  document.getElementById("questionList").innerHTML = "Loading…";

  postToScript({
    action: "getQuestions",
    className: document.getElementById("className").value.trim(),
    courseCode: document.getElementById("courseCode").value.trim(),
    marks: document.getElementById("marks").value
  })
  .then(data => {
    if (data.error) {
      alert(data.error);
      return;
    }
    renderQuestions(data);
  })
  .catch(err => alert("Error loading questions"));
}

/***************************************
 * RENDER QUESTIONS
 ***************************************/
function renderQuestions(questions) {
  const div = document.getElementById("questionList");
  div.innerHTML = "";

  if (!questions.length) {
    div.innerHTML = "No FREE questions available.";
    return;
  }

  questions.forEach(q => {
    const block = document.createElement("div");
    block.className = "question";
    block.innerHTML = `
      <label>
        <input type="checkbox"
          onchange="toggleQuestion(this, '${q.qid.replace(/'/g,"")}', '${q.text.replace(/'/g,"")}')">
        <b>${q.qid}</b> (Module ${q.module})
      </label>
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
    selectedQuestions.push({ qid, text });
  } else {
    selectedQuestions = selectedQuestions.filter(q => q.qid !== qid);
  }
}

/***************************************
 * PRINT PREVIEW
 ***************************************/
function previewPaper() {
  if (!selectedQuestions.length) {
    alert("Select questions first");
    return;
  }

  postToScript({
    action: "preview",
    selected: selectedQuestions,
    templateId: TEMPLATE_ID
  })
  .then(data => {
    if (data.error) {
      alert(data.error);
      return;
    }
    document.getElementById("previewBox").innerText = data.preview;
  });
}

/***************************************
 * CONFIRM & PRINT
 ***************************************/
function confirmAndPrint() {
  if (!document.getElementById("previewBox").innerText.trim()) {
    alert("Generate preview first");
    return;
  }

  postToScript({
    action: "confirm",
    className: document.getElementById("className").value.trim(),
    courseCode: document.getElementById("courseCode").value.trim(),
    marks: document.getElementById("marks").value,
    setName: document.getElementById("setName").value,
    usedQIDs: selectedQuestions.map(q => q.qid),
    finalText: document.getElementById("previewBox").innerText,
    filename: "QuestionPaper"
  })
  .then(data => {
    if (data.error) {
      alert(data.error);
      return;
    }
    alert("PDF generated successfully");
  });
}
