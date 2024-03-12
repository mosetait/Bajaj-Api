const crypto = require("crypto");
const secretKey = process.env.ACCESS_KEY;

exports.auth = async (req, res, next) => {

    try {

        // check request must be POST(-6)
        if(req.method !== "POST"){
            return res.status(405).json({
                responseStatus: "-6",
                responseMessage: "Only Post Method Allowed"
            })
        }

        // Check authorization key
        const { accessKey } = req.body;

        if(!accessKey) {
            return res.status(404).json({
                responseStatus: "-5",
                responseMessage: "authorization key not found",
            });
        }


        // Convert accessKey and secretKey to buffers
        const accessKeyBuffer = Buffer.from(accessKey);
        const secretKeyBuffer = Buffer.from(secretKey);

        // Use constant time comparison
        const isAuth = crypto.timingSafeEqual(accessKeyBuffer, secretKeyBuffer);

        if (!isAuth) {
            console.error(`Unauthorized access attempt from IP ${req.ip}`);
            return res.status(403).json({
                responseStatus: "403",
                responseMessage: `Authorization key mismatch`,
            });
        }

        // Continue with the next middleware or route handler
        next();
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({
            responseStatus: "500",
            responseMessage: `Internal Server Error : ${error}`,
        });
    }
};
