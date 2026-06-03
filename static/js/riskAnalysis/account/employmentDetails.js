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