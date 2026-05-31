// Test to see if the data is showing up

import { RiskAnalyser } from "./riskAnalyser.js";
import accountDetails from "./account/accountDetails.js";
import profileInfoDetails from "./account/profileInfoDetails.js";
import cardRequestDetails from "./account/cardRequestDetails.js";
import employmentDetails from "./account/employmentDetails.js";



const riskAnalyser = new RiskAnalyser()


const riskData = riskAnalyser.calculate(accountDetails, profileInfoDetails, cardRequestDetails, employmentDetails);


console.log(riskData)
