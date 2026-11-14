
import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Only this Firebase user is allowed to administer notes.
const ADMIN_UID = "NsPNRUp7uBekM2c6u4RIFFPCF6I2";

const $ = (id) => document.getElementById(id);

const loginSection = $("loginSection");
const dashboard = $("dashboard");
const loginForm = $("loginForm");
const noteForm = $("noteForm");
const loginStatus = $("loginStatus");
const formStatus = $("formStatus");
const notesList = $("notesList");
const saveButton = $("saveButton");
const cancelEdit = $("cancelEdit");

let editingId = null;
let currentUser = null;

function setStatus(element, message, isError = false) {
    element.textContent = message;
    element.style.color = isError ? "#b91c1c" : "#166534";
}

function isAdmin(user) {
    return Boolean(user && user.uid === ADMIN_UID);
}

function resetNoteForm() {
    editingId = null;
    noteForm.reset();
    $("noteDate").value = new Date().toISOString().slice(0, 10);
    $("published").checked = true;
    $("saveButton").textContent = "Add Notes";
    cancelEdit.classList.add("hidden");
}

function validDriveUrl(value) {
    try {
        const url = new URL(value);
        return (
            url.protocol === "https:" &&
            (url.hostname === "drive.google.com" ||
                url.hostname === "docs.google.com")
        );
    } catch {
        return false;
    }
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    $("loginButton").disabled = true;
    setStatus(loginStatus, "Signing in...");

    try {
        const credential = await signInWithEmailAndPassword(
            auth,
            $("email").value.trim(),
            $("password").value
        );

        if (!isAdmin(credential.user)) {
            await signOut(auth);
            setStatus(loginStatus, "Access denied: this account is not the authorized admin.", true);
            return;
        }

        setStatus(loginStatus, "");
    } catch (error) {
        console.error("Firebase login error:", error.code, error.message);

        setStatus(
            loginStatus,
            `Login error: ${error.code || error.message}`,
            true
        );
    } finally {
        $("loginButton").disabled = false;
    }
});

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user && isAdmin(user)) {
        loginSection.classList.add("hidden");
        dashboard.classList.remove("hidden");
        await loadNotes();
    } else {
        loginSection.classList.remove("hidden");
        dashboard.classList.add("hidden");

        if (user) {
            await signOut(auth);
            setStatus(loginStatus, "Access denied: unauthorized account.", true);
        }
    }
});

$("logoutButton").addEventListener("click", async () => {
    await signOut(auth);
});

noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin(currentUser)) {
        setStatus(formStatus, "Please sign in with the authorized admin account.", true);
        return;
    }

    const title = $("title").value.trim();
    const course = $("course").value;
    const subject = $("subject").value.trim();
    const date = $("noteDate").value;
    const pdfUrl = $("pdfUrl").value.trim();
    const published = $("published").checked;

    if (!validDriveUrl(pdfUrl)) {
        setStatus(formStatus, "Please enter a valid Google Drive or Google Docs HTTPS link.", true);
        return;
    }

    if (!title || !course || !subject || !date) {
        setStatus(formStatus, "Please fill in all required fields.", true);
        return;
    }

    saveButton.disabled = true;

    const note = {
        title,
        course,
        subject,
        date,
        pdfUrl,
        published,
        updatedAt: serverTimestamp()
    };

    try {
        if (editingId) {
            await updateDoc(doc(db, "notes", editingId), note);
            setStatus(formStatus, "Notes updated successfully.");
        } else {
            await addDoc(collection(db, "notes"), {
                ...note,
                createdAt: serverTimestamp()
            });
            setStatus(formStatus, "Notes added successfully.");
        }

        resetNoteForm();
        await loadNotes();
    } catch (error) {
        console.error(error);
        setStatus(formStatus, "Could not save notes. Check Firestore rules and connection.", true);
    } finally {
        saveButton.disabled = false;
    }
});

cancelEdit.addEventListener("click", () => {
    resetNoteForm();
    setStatus(formStatus, "");
});

async function loadNotes() {
    if (!isAdmin(currentUser)) return;

    notesList.textContent = "Loading notes...";

    try {
        const notesQuery = query(
            collection(db, "notes"),
            orderBy("date", "desc")
        );

        const snapshot = await getDocs(notesQuery);
        notesList.replaceChildren();

        if (snapshot.empty) {
            notesList.textContent = "No notes added yet.";
            return;
        }

        snapshot.forEach((item) => {
            const note = item.data();
            const card = document.createElement("article");
            card.className = "note";

            const heading = document.createElement("h3");
            heading.textContent = note.title || "Untitled notes";

            const details = document.createElement("p");
            details.textContent =
                `${note.course || ""} • ${note.subject || ""} • ${note.date || ""}`;

            const status = document.createElement("p");
            status.textContent = note.published ? "Published" : "Draft";

            const link = document.createElement("a");
            link.href = note.pdfUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Open PDF link";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => {
                editingId = item.id;
                $("title").value = note.title || "";
                $("course").value = note.course || "";
                $("subject").value = note.subject || "";
                $("noteDate").value = note.date || "";
                $("pdfUrl").value = note.pdfUrl || "";
                $("published").checked = note.published === true;
                $("saveButton").textContent = "Save Changes";
                cancelEdit.classList.remove("hidden");
                window.scrollTo({ top: 0, behavior: "smooth" });
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "danger";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", async () => {
                if (!isAdmin(currentUser)) return;
                if (!window.confirm(`Delete "${note.title}"?`)) return;

                try {
                    await deleteDoc(doc(db, "notes", item.id));
                    setStatus(formStatus, "Notes deleted.");
                    await loadNotes();
                } catch (error) {
                    console.error(error);
                    setStatus(formStatus, "Could not delete notes.", true);
                }
            });

            card.append(heading, details, status, link, document.createElement("br"), editButton, deleteButton);
            notesList.append(card);
        });
    } catch (error) {
        console.error(error);
        notesList.textContent = "Could not load notes. Check Firestore rules and connection.";
    }
}

resetNoteForm();
