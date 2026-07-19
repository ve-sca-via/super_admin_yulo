import { createContext, useCallback, useContext, useState } from "react";

import { DOCUMENT_TYPES, mockPartner } from "@/mocks/fixtures";

const OnboardingContext = createContext(null);

// Local state for the Flow 1 screens (document upload progress, verification
// status, training progress). Scoped to the onboarding stack in
// RootNavigator.jsx — once a real backend exists this becomes a TanStack
// Query hook reading/writing the partner's actual onboarding record instead.
export function OnboardingProvider({ children }) {
  const [documents, setDocuments] = useState(mockPartner.documents);
  const [verificationStatus, setVerificationStatus] = useState("under_review");
  const [training, setTraining] = useState({
    moduleId: "veg-handling",
    moduleLabel: "Veg Handling SOP",
    moduleIndex: 2,
    totalModules: 3,
    watchedSeconds: 0,
    durationSeconds: 8 * 60 + 20,
  });

  const markDocumentUploaded = useCallback((type) => {
    setDocuments((prev) => ({ ...prev, [type]: "uploaded" }));
  }, []);

  const uploadedCount = Object.values(documents).filter((s) => s === "uploaded").length;
  const nextDocType = DOCUMENT_TYPES.find((d) => documents[d.type] !== "uploaded")?.type ?? null;

  const approveVerification = useCallback(() => setVerificationStatus("approved"), []);

  return (
    <OnboardingContext.Provider
      value={{
        documents,
        markDocumentUploaded,
        uploadedCount,
        totalDocuments: DOCUMENT_TYPES.length,
        nextDocType,
        verificationStatus,
        approveVerification,
        training,
        setTraining,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be inside OnboardingProvider");
  return ctx;
}
