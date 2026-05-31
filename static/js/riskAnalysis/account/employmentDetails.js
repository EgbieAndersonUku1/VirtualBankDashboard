import { EmploymentTypeLabel, PayFrequency, Contract } from "../rules/employment.js";


export const employmentDetails = {
    employed: true,
    employmentType: EmploymentTypeLabel.SELF_EMPLOYED,
    employerName: "Greenlight Timelord Productions",
    yearsEmployed: 3,
    salary: 30000,
    payFrequency: PayFrequency.MONTHLY,
    contractType: Contract.PERMANENT
};


export default employmentDetails;