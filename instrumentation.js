// instrumentation.js
import { NodeSDK } from "@opentelemetry/sdk-node";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { BSON } from "bson"; // Add this import

const sdk = new NodeSDK({
  instrumentations: [
    // Get all auto instrumentations except MongoDB
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-mongodb": {
        enabled: false, // Disable default MongoDB instrumentation
      },
    }),

    // Add custom MongoDB instrumentation
    new MongoDBInstrumentation({
      enhancedDatabaseReporting: true,
      responseHook: (span, responseInfo) => {
        try {
          // The data is already parsed, no need for BSON.deserialize()
          const parsedData = responseInfo.data;

          if (span.attributes["db.operation"] === "explain") {
            console.log("🔍 Explain operation detected");
            const document = BSON.deserialize(parsedData.bson);

            span.setAttributes({
              "mongodb.queryShapeHash": document.queryShapeHash || "N/A",
              "mongodb.stage": document.queryPlanner.winningPlan.stage || "N/A",
              "mongodb.winningPlan":
                JSON.stringify(document.queryPlanner.winningPlan, null, 2) ||
                "N/A",
              "mongodb.totalDocsExamined":
                document.executionStats.totalDocsExamined || 0,
              "mongodb.totalKeysExamined":
                document.executionStats.totalKeysExamined || 0,
              "mongodb.nReturned": document.executionStats.nReturned || 0,
            });
          }
        } catch (error) {
          console.error("❌ Error in responseHook:", error.message);
        }
      },
    }),
  ],
});

sdk.start();
console.log("🔍 OpenTelemetry started with custom MongoDB instrumentation");
