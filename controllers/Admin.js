const Stockist = require("../models/Stockist");
const Product = require("../models/Product");


// Create stockist
exports.createStockist = async (req , res) => {

    try{
        const {
            name,
            tradeName,
            gstNo,
            principalPlaceOfBusiness,
            state,
            districts,
            modelCodeForValidation,
            dealerCode
        } = req.body;

        // Validation
        if(
            !name ||
            !tradeName ||
            !gstNo ||
            !principalPlaceOfBusiness ||
            !state ||
            !districts ||
            !dealerCode ||
            !modelCodeForValidation
        ){
            return res.status(401).json({
                success: false,
                message: "Please fill all the information"
            })
        }

        // check if the stockist exist
        const existingSTK = await Stockist.findOne({
            $or: [
                { gstNo: gstNo },
                { principalPlaceOfBusiness: principalPlaceOfBusiness },
                { dealerCode: dealerCode }
            ]
        });

        if (existingSTK) {
            return res.status(400).json({
                success: false,
                message: "Some information already exists in another stockist"
            });
        }


        const newSTK = await Stockist.create({
            name,
            tradeName,
            gstNo,
            principalPlaceOfBusiness,
            state,
            districts,
            dealerCode,
            modelCodeForValidation
        })

        return res.status(200).json({
            success: true,
            message: "Stockist created successfully"
        })
    }
    catch(error){
        console.log(`Error while creating stockist : ${error}`);
        return res.status(401).json({
            success: false,
            message: "Error while creating stockist",
        })
    }

}

// update stockist
exports.updateStockist = async (req , res) => {

    try{
        const {
            id,
            name,
            tradeName,
            gstNo,
            principalPlaceOfBusiness,
            address,
            state,
            districts,
            email,
            contactNo,
            dealerCode
        } = req.body;

        // Validation
        if(
            !id ||
            !name ||
            !tradeName ||
            !gstNo ||
            !principalPlaceOfBusiness ||
            !address ||
            !state ||
            !districts ||
            !email ||
            !dealerCode
        ){
            return res.status(401).json({
                success: false,
                message: "Please fill all the information"
            })
        }

        // check if the stockist exist
        const existingSTK = await Stockist.findOne({_id: id});

        if (!existingSTK) {
            return res.status(404).json({
                success: false,
                message: "Stockist not found"
            });
        }


        await existingSTK.updateOne({
            name,
            tradeName,
            gstNo,
            principalPlaceOfBusiness,
            address,
            state,
            districts,
            email,
            contactNo,
            dealerCode
        })

        await existingSTK.save();

        return res.status(200).json({
            success: true,
            message: "Stockist updated successfully",
            existingSTK
        })
    }
    catch(error){
        console.log(`Error while updating stockist : ${error}`);
        return res.status(401).json({
            success: false,
            message: "Error while updating stockist"
        })
    }

}


// delete stockist
exports.deleteStockist = async (req, res) => {

    try {

        const { id } = req.body;

        // Validation
        if (!id) {
            return res.status(401).json({
                success: false,
                message: "Please provide stockist id"
            });
        }

        const existingSTK = await Stockist.findOne({ _id: id });

        if (!existingSTK) {
            return res.status(404).json({
                success: false,
                message: "Stockist not found"
            });
        }

        // Update products to remove the reference to the stockist
        await Product.updateMany(
            { stockist: id }, // Find products where stockist is present
            { $unset: { stockist: 1 } } // Unset the stockist field
        );

        // Delete the stockist document
        await Stockist.deleteOne({ _id: id });

        return res.status(200).json({
            success: true,
            message: "Stockist deleted successfully"
        });
    } 
    catch (error) {
        console.log(`Error while deleting stockist : ${error}`);
        return res.status(500).json({
            success: false,
            message: "Error while deleting stockist"
        });
    }
};



// ---------------------------------------------------------------------------------------



// add products to stockist
exports.addProductsToStockist = async (req, res) => {

    try {

        const { arrayOfProducts, stockistId } = req.body;

        // Validations
        if (!arrayOfProducts || !stockistId) {
            return res.status(401).json({
                success: false,
                message: "Please fill all the fields"
            });
        }

        // Check if all required fields are filled in each product
        for (const product of arrayOfProducts) {
            if (
                !product.serialNumber ||
                !product.materialCode ||
                !product.itemType ||
                !product.itemModel
            ) {
                return res.status(401).json({
                    success: false,
                    message: "Please fill all info in products info"
                });
            }

            // Add stockistId to each product
            product.stockist = stockistId;
        }


        // Check if stockist exists
        const existingSTK = await Stockist.findOne({ _id: stockistId });

        if (!existingSTK) {
            return res.status(404).json({
                success: false,
                message: "Stockist not found"
            });
        }


        // Check if any serial numbers already exist
        const existingSerialNumbers = await Product.find({
            serialNumber: { $in: arrayOfProducts.map(product => product.serialNumber) }
        });

        if (existingSerialNumbers.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some serial numbers already exist"
            });
        }


        // Check if there are any duplicate serial numbers within the incoming products
        const serialNumbersSet = new Set();
        for (const product of arrayOfProducts) {
            if (serialNumbersSet.has(product.serialNumber)) {
                return res.status(400).json({
                    success: false,
                    message: "Duplicate serial numbers found"
                });
            }
            serialNumbersSet.add(product.serialNumber);
        }

        
        // Create products
        const createdProducts = await Product.create(arrayOfProducts);

        // Get IDs of created products
        const productIds = createdProducts.map(product => product._id);

        // Add product IDs to the stockist's product array
        existingSTK.products.push(...productIds);

        // Save the updated stockist document
        await existingSTK.save();

        return res.status(200).json({
            success: true,
            message: "Products added to stockist successfully",
            existingSTK
        });

    } 
    catch (error) {
        console.log(`Error while adding products to stockist : ${error}`);
        return res.status(500).json({
            success: false,
            message: "Error while adding products to stockist"
        });
    }
};



// delete products from stockist
exports.deleteProductsFromStockist = async (req, res) => {

    try {

        const { arrayOfProductIds, stockistId } = req.body;

        if (!arrayOfProductIds || !stockistId) {
            return res.status(401).json({
                success: false,
                message: "Please fill all info"
            });
        }

        // Check if stockist exists
        const existingSTK = await Stockist.findOne({ _id: stockistId });

        if (!existingSTK) {
            return res.status(404).json({
                success: false,
                message: "Stockist not found"
            });
        }


        // Check if all products exist
        const existingProducts = await Product.find({ _id: { $in: arrayOfProductIds } });

        if (existingProducts.length !== arrayOfProductIds.length) {
            // Some products do not exist
            const nonExistingProductIds = arrayOfProductIds.filter(productId => !existingProducts.map(product => product._id.toString()).includes(productId));

            return res.status(404).json({
                success: false,
                message: `The following products do not exist: ${nonExistingProductIds.join(', ')}`
            });
        }


        // Check if all product IDs are available in the stockist's product array
        const stockistProductIds = existingSTK.products.map(productId => productId.toString());
        const missingProductIds = arrayOfProductIds.filter(productId => !stockistProductIds.includes(productId));

        if (missingProductIds.length > 0) {
            return res.status(404).json({
                success: false,
                message: `The following products are not associated with the stockist: ${missingProductIds.join(', ')}`
            });
        }


        // Delete the products from the database
        await Product.deleteMany({ _id: { $in: arrayOfProductIds } });

        // Remove the deleted products from the stockist's product array
        existingSTK.products = existingSTK.products.filter(productId => !arrayOfProductIds.includes(productId.toString()));


        // Save the updated stockist document
        await existingSTK.save();

        return res.status(200).json({
            success: true,
            message: "Products deleted from stockist successfully"
        });

    } 
    catch (error) {
        console.log(`Error while deleting products from stockist : ${error}`);
        return res.status(500).json({
            success: false,
            message: "Error while deleting products from stockist"
        });
    }
};





// Update product 
exports.updateProduct = async (req, res) => {

    try{
        
        const {
            id,
            serialNumber,
            materialCode,
            itemType,
            itemModel,
            dateOfManufacture,
            stockistId
        } = req.body;

        // validations
        if (
            !id ||
            !serialNumber ||
            !materialCode ||
            !itemType ||
            !itemModel ||
            !dateOfManufacture ||
            !stockistId
        ) 
        {
            return res.status(401).json({
                success: false,
                message: "Please fill all info "
            });
        } 


        // check if serial number exist
        const product = await Product.findOne({_id: id});

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // check if stockist exist
        const existingSTK = await Stockist.findOne({ _id: stockistId });

        if (!existingSTK) {
            return res.status(404).json({
                success: false,
                message: "Stockist not found"
            });
        }


        // check if the stockist changed or not

        if (product.stockist.toString() !== stockistId) {

                const oldSTK = await Stockist.findOne({ _id: product.stockist });

                if (!oldSTK) {
                    return res.status(404).json({
                        success: false,
                        message: "Old Stockist not found"
                    });
                }

                // Remove product._id from oldSTK.products
                oldSTK.products = oldSTK.products.filter(productId => productId.toString() !== product._id.toString());
                
                // add new stockist to the product
                existingSTK.products.push(product._id);
                product.stockist = existingSTK._id;

                // Save the updated stockists document
                await oldSTK.save();
                await existingSTK.save();
                
                // now update rest of the info of product
                await product.updateOne({
                    serialNumber,
                    materialCode,
                    itemType,
                    itemModel,
                    dateOfManufacture,
                })

                await product.save();
        }
        
        await product.updateOne({
            serialNumber,
            materialCode,
            itemType,
            itemModel,
            dateOfManufacture,
        });

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        })
    }   
    catch(error){
        
        if (error.code === 11000 && error.keyPattern && error.keyPattern.serialNumber === 1) {
            // Duplicate key error for serialNumber
            return res.status(400).json({
                success: false,
                message: "Serial number already exists. Please use a different serial number."
            });
        } else {
            console.log(`Error while updating products : ${error}`);
            return res.status(500).json({
                success: false,
                message: "Error while updating products"
            });
        }
    }
    

};



