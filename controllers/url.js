const shortid = require("shortid");
const URL = require("../models/url");

async function handleGenerateNewShortUrl(req, res) {
  const body = req.body;
  if (!body.url) {
    return res.status(400).json({ error: "url is required" });
  }
  const shortId = shortid(8);
  try {
    await URL.create({
      shortId: shortId,
      redirectURL: body.url,
      visitHistory: [],
      createdBy:req.user._id,
    });
    return res.render("home", { id: shortId });
   
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "something went wrong" });
  }
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  console.log("Received shortId:", shortId);
  try {
    const result = await URL.findOne({ shortId });

    if (!result) {
      return res.status(404).json({ error: "Short ID not found" });
    }

    return res.json({
      totalClicks: result.visitHistory.length,
      analytics: result.visitHistory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
module.exports = { handleGenerateNewShortUrl, handleGetAnalytics };
