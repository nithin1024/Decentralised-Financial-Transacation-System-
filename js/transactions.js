/**
 * Smart Contract Simulator (Unit 3 & Unit 2 Applications)
 * Demonstrates how conditional logic is encoded as transactions.
 */
class SmartContract {
    
    /**
     * Trade Finance: Contract-based Payment
     * "If conditions met -> release funds"
     */
    static executeTradeFinance(buyerWallet, sellerAddress, amount) {
        if (!buyerWallet) throw new Error("Buyer wallet required.");
        // We simulate the condition being met and encode it as a TradeFinance transaction
        let tx = new Transaction(
            buyerWallet.publicKey, 
            sellerAddress, 
            amount, 
            "TradeFinance", 
            "Contract: Payment upon shipment verification"
        );
        tx.signTransaction(buyerWallet);
        DFTS.addTransaction(tx);
        return tx;
    }
    
    /**
     * Supply Chain: Tracking Goods
     * Transactions can have 0 financial value but carry important immutable data.
     */
    static executeSupplyChain(actorWallet, itemID, newLocation) {
        if (!actorWallet) throw new Error("Actor wallet required.");
        let tx = new Transaction(
            actorWallet.publicKey, 
            "SYSTEM", // Sent to no specific user, just logged on chain
            0, 
            "SupplyChain", 
            `Item [${itemID}] scanned at Location [${newLocation}]`
        );
        tx.signTransaction(actorWallet);
        DFTS.addTransaction(tx);
        return tx;
    }
    
    /**
     * Health Insurance: Secure Data Transfer
     */
    static executeHealthInsurance(patientWallet, hospitalAddress, medicalDataHash) {
        if (!patientWallet) throw new Error("Patient wallet required.");
        let tx = new Transaction(
            patientWallet.publicKey, 
            hospitalAddress, 
            0, 
            "HealthInsurance", 
            `Auth Data Hash: ${medicalDataHash}`
        );
        tx.signTransaction(patientWallet);
        DFTS.addTransaction(tx);
        return tx;
    }
}
