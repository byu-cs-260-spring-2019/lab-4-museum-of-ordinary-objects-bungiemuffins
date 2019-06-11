const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const app = express();


// Create a new item in the museum: takes a title and a path to an image.
var db = firebase.firestore();
var itemsRef = db.collection('items');

app.post('/api/items', async (req, res) => {
    try {
        let querySnapshot = await itemsRef.get();
        let numRecords = querySnapshot.docs.length;
        let item = {
            id: numRecords + 1,
            title: req.body.title,
            path: req.body.path
        };
        itemsRef.doc(item.id.toString()).set(item);
        res.send(item);
      } catch (error) {
        console.log(error);
        res.sendStatus(500);
      }
});
// Get a list of all of the items in the museum.
app.get('/api/items', async (req, res) => {
    try{
        let querySnapshot = await itemsRef.get();
        console.log(querySnapshot);
        console.log(querySnapshot.docs);
        res.send(querySnapshot.docs.map(doc => doc.data()));
    }catch(err){
        res.sendStatus(500);
    }
});


//works when deployed
// Delete an item from the museum.
app.delete('/api/items/:id', async (req, res) => {
    let id = req.params.id.toString();
    var documentToDelete = itemsRef.doc(id);
    console.log(documentToDelete);
    try {
        var doc = await documentToDelete.get();
        if(!doc.exists) {
            res.status(404).send("Sorry, that item doesn't exist");
            return;
        }
        else {
            documentToDelete.delete();
            res.sendStatus(200);
            return;
        }
    }
    catch(err) {
        res.status(500).send("Error deleting document: ", err);
    }
});

//edit an items title
app.put('/api/items/:id', async (req, res) => {
    let id = req.params.id.toString();
    let itemtitle = req.params.title;
    var documentToEdit = itemsRef.doc(id);
    try {
        var doc = await documentToEdit.get();
        if(!doc.exists) {
            res.status(404).send("Sorry, that item doesn't exist");
            return;
        }
        else {
            documentToEdit.update({
                title: itemtitle
            });
        }
    }
    catch(err) {
        res.status(500).send("Error editing document", err);
    }
});

exports.app = functions.https.onRequest(app);