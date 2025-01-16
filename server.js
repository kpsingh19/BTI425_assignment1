const express = require ('express');
const cors = require('cors');
const ListingsDB = require("./modules/listingsDB.js");
const db = new ListingsDB();
require('dotenv').config();

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({ message: "API Listening" });
  });

app.post('/api/listings', async (req,res)=> {

    try{

        const data = req.body;

        if(!data || Object.keys(data).length==0){
            return res.status(400).json({error: "Body is required in order to add a new listing"});
        }

        const newListing = await db.addNewListing(data);

        res.status(201).json(newListing)
    }
catch (error) {
    console.error("Error adding a new listing", error);
    res.status(500).json("Failed to add a new listing");
}

});

app.get('/api/listings', async (req,res)=>{

    try{

        const page= parseInt(req.query.page, 10) || 1;
        const perPage= parseInt(req.query.perPage, 10) || 10;
        const name= req.query.name || null;

        if(page<=0||perPage<=0){
            return res.status(400).json({error: "page and perPage must be positive"});
        }

        const listings = await db.getAllListings(page, perPage, name);

        res.status(201).json(listings)
    }
    catch(error){
        console.error("Error searching for a listing", error);
        res.status(500).json("Failed to search for the specified listing")
    }
})

app.get('/api/listings/:_id', async (req, res) => {
    try {
      const id = req.params._id;
  
     if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
  
      const listing = await db.getListingById(id);
      if (!listing) {
        return res.status(404).json({ error: "Listing  is not found." });
      }
  
      res.status(200).json(listing); // Return the found listing
    } catch (error) {
      console.error("Error searching listing by ID:", error);
      res.status(500).json({ error: "Failed to search listing by ID." });
    }
  });

  app.put('/api/listings/:_id', async (req, res) => {
    try {
      const id = req.params._id;
      const data = req.body;
    
  
     if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      if(!data || Object.keys(data).length==0){
        return res.status(400).json({error: "Body is required in order to edit a listing"});
    }
  
      const updatedListing = await db.updateListingById(data,id);
      if (!updatedListing) {
        return res.status(404).json({ error: "Listing  is not found." });
      }
  
      res.status(200).json({
        message: "Listing updated successfully",
        updatedListing: updatedListing
      });
    } catch (error) {
      console.error("Error updating listing", error);
      res.status(500).json({ error: "Failed to update the requested listings" });
    }
  });
  

  app.delete('/api/listings/:_id', async (req, res) => {
    try {
      const id = req.params._id;
  
     if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      
      const deletedListing = await db.deleteListingById(id);
      if (!deletedListing) {
        return res.status(404).json({ error: "Listing  is not found." });
      }
      res.status(200).json({
        message: "Listing deleted successfully",
        deletedListing: deletedListing
      });
    } catch (error) {
      console.error("Error deleting listing by ID:", error);
      res.status(500).json({ error: "Failed to delete listing by ID." });
    }
  });


  


  db.initialize(process.env.MONGODB_CONN_STRING).then(()=>{
    app.listen(HTTP_PORT, ()=>{
    console.log(`server listening on: ${HTTP_PORT}`);
    });
    }).catch((err)=>{
    console.log(err);
    });