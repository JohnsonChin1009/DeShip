pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";

template ScholarshipEligibility() {
    // Public inputs
    signal input minGPA;
    signal input maxIncome;

    // Private inputs
    signal input gpa;
    signal input fieldRelevance;
    signal input householdIncome;
    signal input statementScore;

    // Outputs
    signal output isEligible;
    signal output impactScore;

    // GPA >= minGPA
    component gpaCheck = GreaterEqThan(16); // assuming 16-bit range
    gpaCheck.in[0] <== gpa;
    gpaCheck.in[1] <== minGPA;

    // Income <= maxIncome
    component incomeCheck = LessEqThan(32);
    incomeCheck.in[0] <== householdIncome;
    incomeCheck.in[1] <== maxIncome;

    // Final eligibility (1 if both are true)
    isEligible <== gpaCheck.out * incomeCheck.out;

    // Impact score formula (INTEGER-BASED, weights scaled by 100):
    // impactScore = gpa*35 + fieldRelevance*20 + statementScore*45 - income/1000
    signal gpaScore;
    signal incomePenalty;

    gpaScore <== gpa * 35;
    incomePenalty <== householdIncome / 1000;

    impactScore <== gpaScore + (fieldRelevance * 20) + (statementScore * 45) - incomePenalty;

    // Constrain output only if eligible
    isEligible * 1 === isEligible; // force boolean (0 or 1)
}

component main { public [minGPA, maxIncome] } = ScholarshipEligibility();