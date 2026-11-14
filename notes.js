
import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const grid = document.getElementById("notesGrid");
const count = document.getElementById("resultsCount");
const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const subjectFilter = document.getElementById("subjectFilter");

let allNotes = [];

function showMessage(message) {
    grid.replaceChildren();
    const p = document.createElement("p");
    p.className = "message";
    p.textContent = message;
    grid.append(p);
}

function addFilterOptions(select, values, label) {
    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = `All ${label}`;
    select.append(allOption);

    values.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.append(option);
    });
}

function renderNotes() {
    const search = searchInput.value.trim().toLowerCase();
    const course = courseFilter.value;
    const subject = subjectFilter.value;

    const filtered = allNotes.filter(note => {
        const matchesSearch =
            `${note.title || ""} ${note.subject || ""} ${note.course || ""}`
                .toLowerCase()
                .includes(search);

        return matchesSearch &&
            (!course || note.course === course) &&
            (!subject || note.subject === subject);
    });

    grid.replaceChildren();
    count.textContent = `${filtered.length} notes found`;

    if (filtered.length === 0) {
        showMessage("No notes found. Please try another search.");
        return;
    }

    filtered.forEach(note => {
        const card = document.createElement("article");
        card.className = "note-card";

        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = note.course || "Study Material";

        const title = document.createElement("h2");
        title.textContent = note.title || "Untitled Notes";

        const meta = document.createElement("p");
        meta.className = "meta";
        meta.textContent =
            `Subject: ${note.subject || "General"}\nDate: ${note.date || "N/A"}`;
        meta.style.whiteSpace = "pre-line";

        const link = document.createElement("a");
        link.className = "download";
        link.href = note.pdfUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View / Download PDF";

        card.append(tag, title, meta, link);
        grid.append(card);
    });
}

async function loadNotes() {
    showMessage("Loading notes...");

    try {
        const notesQuery = query(
            collection(db, "notes"),
            where("published", "==", true)
        );

        const snapshot = await getDocs(notesQuery);

        allNotes = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data()
        }));

        addFilterOptions(
            courseFilter,
            [...new Set(allNotes.map(n => n.course).filter(Boolean))].sort(),
            "Courses"
        );

        addFilterOptions(
            subjectFilter,
            [...new Set(allNotes.map(n => n.subject).filter(Boolean))].sort(),
            "Subjects"
        );

        renderNotes();
    } catch (error) {
        console.error("Unable to load notes:", error);
        showMessage(
            "Notes could not be loaded. Please check the database rules and connection."
        );
        count.textContent = "Unable to load notes";
    }
}

searchInput.addEventListener("input", renderNotes);
courseFilter.addEventListener("change", renderNotes);
subjectFilter.addEventListener("change", renderNotes);

loadNotes();
