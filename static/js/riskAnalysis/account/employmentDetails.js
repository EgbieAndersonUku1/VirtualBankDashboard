/**
 * Employment Details Configuration
 *
 * This file defines the employment dataset used as input for the risk analysis system.
 *
 * It represents the user's employment status, income information, and contract details,
 * which are used to evaluate financial stability and contribute to overall risk scoring.
 *
 * The values in this object are intentionally designed to be manually editable in order
 * to simulate different employment scenarios and observe how changes affect:
 *
 * 1. Risk analysis outcomes (scoring, decision logic, and rule evaluation)
 * 2. UI rendering (display of employment-related information in the frontend)
 *
 * This file contains static configuration data only and should not include business logic
 * or computed values. All analysis and processing are handled elsewhere in the system.
 */


import { EmploymentTypeLabel, PayFrequency, Contract } from "../rules/employment.js";



export const employmentDetails = {
    employed: false,
    employmentType: EmploymentTypeLabel.UNEMPLOYED,
    employerName: "Greenlight Timelord Productions",
    yearsEmployed: 3,
    salary: 30000,
    payFrequency: PayFrequency.MONTHLY, 
    contractType: Contract.PERMANENT
};


export default employmentDetails;