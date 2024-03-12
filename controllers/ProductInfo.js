const { MongoClient, ObjectId } = require('mongodb');


const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;


// For bajaj
exports.getProdcuctInfo = async (req, res) => {

    try {

        const {

            materialCode,
            serialNumber,
            dealerCode,
            dealerId,

        } = req.body;

        // Validation
        if (!materialCode || !serialNumber || !dealerCode || !dealerId) {
            return res.status(401).json({
                success: false,
                message: "Please provide all fields"
            });
        }

        
        // Connection with the database (using connection pooling)
        const uri = process.env.BAJAJ_MONGO_CREDS;
        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db(dbName);
            const collection = database.collection(collectionName);


            // Getting product info
            // !start

            // validating serial number (-1)
            const isSerialNo = await collection.findOne({serialNumber});


            if(!isSerialNo){
                return res.status(404).json({
                    responseStatus: "-1",
                    responseMessage: "Invalid Serial Number"
                })
            }

            // check serial no. is validated or not (-3)
            if(isSerialNo.isSold == true){
                return res.status(401).json({
                    responseStatus: "-3",
                    responseMessage: "Serial Number Already Validated"
                })
            }



            // validating material code
            const isMaterialCode = await collection.findOne({materialCode});

            if(!isMaterialCode){
                return res.status(404).json({
                    responseStatus: "-4",
                    responseMessage: "Invalid Material Code"
                })
            }


            // validating dealer code
            const isDealerCode = await collection.findOne({dealerCode});

            if(!isDealerCode){
                return res.status(404).json({
                    responseStatus: "-7",
                    responseMessage: "Invalid Dealer Code"
                })
            }


            // validating Dealer id
            const isDealerId = await collection.findOne({dealerId});

            if(!isDealerId){
                return res.status(404).json({
                    responseMessage: "Invalid Dealer Id"
                })
            }



            // checking serial number with the dealer code
            let checkSerialNumberWithDealerResult = isSerialNo.dealerCode ==  dealerCode;

            if(!checkSerialNumberWithDealerResult){
                return res.status(401).json({
                    responseStatus: "-8",
                    responseMessage: "Serial No. Not Billed to this Dealer Code"
                })
            }

            // checking serial number with the dealer id
            let checkSerialNumberWithDealerId = isSerialNo.dealerId ==  dealerId;

            if(!checkSerialNumberWithDealerId){
                return res.status(401).json({
                    responseStatus: "-8",
                    responseMessage: "Serial No. Not Billed to this Dealer Id"
                })
            }


            
            
            
            // !end

            return res.status(200).json({
                responseStatus: "0",
                responseMessage: "Valid Serial Number",
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








