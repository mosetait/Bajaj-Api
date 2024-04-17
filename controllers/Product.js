const Stockist = require("../models/Stockist");
const Product = require("../models/Product");


// for bajaj
exports.getProdcuctInfo = async (req , res) => {

    try{

        const {
            materialCode,
            serialNumber,
            dealerCode,
        } = req.body;

        // Validation
        if (!materialCode || !serialNumber || !dealerCode) {
            return res.status(401).json({
                success: false,
                message: "Please provide all fields"
            });
        }

        // validating serial number (-1)
        const isSerialNo = await Product.findOne({serialNumber});


        if(!isSerialNo){
            return res.status(404).json({
                responseStatus: "-1",
                responseMessage: "Invalid Serial Number"
            })
        }

        // check serial no. is validated or not (-3)
        if(isSerialNo.isValidated == true){
            return res.status(401).json({
                responseStatus: "-3",
                responseMessage: "Serial Number Already Validated"
            })
        }



        // validating material code (-4)
        const isMaterialCode = await Product.findOne({materialCode});

        if(!isMaterialCode){
            return res.status(404).json({
                responseStatus: "-4",
                responseMessage: "Invalid Material Code"
            })
        }



        // validating dealer code (-7)
        const isDealerCode = await Stockist.findOne({dealerCode});


        if(!isDealerCode){
            return res.status(404).json({
                responseStatus: "-7",
                responseMessage: "Invalid Dealer Code"
            })
        }


        // check if Serial No. Billed to this Dealer (-8)
        const billing = isDealerCode.products.includes(isSerialNo._id);

        if(!billing){
            return res.status(401).json({
                responseStatus: "-8",
                responseMessage: "Serial No. Not Billed to this Dealer"
            })
        }

        
        await Product.findOneAndUpdate({ serialNumber }, { isValidated: true });


        return res.status(200).json({
            responseStatus: "0",
            responseMessage: "Valid Serial Number", 
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Error Occurred while fetching product information: ${error}`
        });
    }

}

