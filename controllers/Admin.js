const { MongoClient, ObjectId } = require('mongodb');

const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;



// create product Info
exports.createProdcuctInfo = async (req, res) => {

    try {

        const {
            materialCode,
            serialNumber,
            dealerCode,
            dealerId,
            itemType,
            dateOfManufacture,
            assignedTo,
            itemModel,
            isSold,
            username,
            password
        } = req.body;

        // Validation
        if (
            !materialCode || 
            !serialNumber || 
            !dealerCode || 
            !dealerId || 
            !itemType || 
            !dateOfManufacture || 
            !assignedTo ||   
            !itemModel || 
            // !isSold || 
            !username || 
            !password) {
            return res.status(401).json({
                success: false,
                message: "Please provide all fields"
            });
        }


        
        // Connection with the database (using connection pooling)
        const uri = `mongodb+srv://${username}:${password}@bajajapi.9enhja0.mongodb.net/?retryWrites=true&w=majority&appName=BajajApi`;
        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db(dbName);
            const collection = database.collection(collectionName);

            // check if info available already
            const existingSerialNo = await collection.findOne({ serialNumber: serialNumber })

            if(existingSerialNo){
                return res.status(409).json({
                    success:false,
                    message: "Item with this Serial Number already exists."
                })
            }

            // Creating product info

            const date = new Date(dateOfManufacture);

            const productInformation = await collection.insertOne({
                materialCode,
                serialNumber,
                dealerCode,
                dealerId,
                itemType,
                dateOfManufacture : date,
                assignedTo,
                itemModel,
                isSold
            });


            return res.status(200).json({
                success: true,
                message: "Product Information Created Successfully",
                productInformation
            });

        } 
        catch (error) {
            return res.status(500).json({
                success: false,
                message: `Error while connecting with DB or creating product information: ${error}`
            });
        } 
        finally {
            // Close the connection after the operation is done
            if (client) {
                await client.close();
            }
        }
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Error Occurred while creating product information: ${error}`
        });
    }
};


// Update product Info
exports.updateProdcuctInfo = async (req, res) => {

    try {

        const {
            id,
            materialCode,
            serialNumber,
            dealerCode,
            dealerId,
            itemType,
            dateOfManufacture,
            assignedTo,
            itemModel,
            status,
            username,
            password
        } = req.body;

        // Validation
        if (
            !id ||
            !materialCode ||
            !serialNumber || 
            !dealerCode || 
            !dealerId || 
            !itemType || 
            !dateOfManufacture ||
            !assignedTo || 
            !itemModel || 
            !status || 
            !username || 
            !password
        ) {
            return res.status(401).json({
                success: false,
                message: "Please provide all fields"
            });
        }

        // Connection with the database (using connection pooling)
        
        const uri = `mongodb+srv://${username}:${password}@bajajapi.9enhja0.mongodb.net/?retryWrites=true&w=majority&appName=BajajApi`;
        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db(dbName);
            const collection = database.collection(collectionName);

            // Finding the document by _id
            const document = await collection.findOne({ _id: new ObjectId(id) });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found"
                });
            }


            // Updating product info
            const date = new Date(dateOfManufacture);

            const productInformation = await collection.updateOne(
                
                { _id: new ObjectId(id) },
                {
                    $set: {
                        materialCode,
                        serialNumber,
                        dealerCode,
                        dealerId,
                        itemType,
                        dateOfManufacture : date,
                        assignedTo,
                        itemModel,
                        status
                    }
                }
            );

            return res.status(200).json({
                success: true,
                message: "Product Information Updated Successfully",
                productInformation
            });
        } 
        catch (error) {
            return res.status(500).json({
                success: false,
                message: `Error while connecting with DB : ${error}`
            });
        } 
        finally {
            // Close the connection after the operation is done
            await client.close();
        }
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Error Occurred while updating product information: ${error}`
        });
    }
};


// Delete Product Info
exports.deleteProdcuctInfo = async (req, res) => {
    try {
        const {
            id,
            username,
            password
        } = req.body;

        // Validation
        if (!id || !username || !password) {
            return res.status(401).json({
                success: false,
                message: "Please provide id, username, and password"
            });
        }


        // Connection with the database (using connection pooling)
        const uri = `mongodb+srv://${username}:${password}@bajajapi.9enhja0.mongodb.net/?retryWrites=true&w=majority&appName=BajajApi`;
        const client = new MongoClient(uri);

        try {

            await client.connect();
            const database = client.db(dbName);
            const collection = database.collection(collectionName);

            // Deleting product info
            const result = await collection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found for deletion"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Product Information Deleted Successfully"
            });
        } 
        catch (error) {
            return res.status(500).json({
                success: false,
                message: `Error while connecting with DB or deleting product information: ${error}`
            });
        } 
        finally {
            // Close the connection after the operation is done
            if (client) {
                await client.close();
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Error Occurred while deleting product information: ${error}`
        });
    }
};
