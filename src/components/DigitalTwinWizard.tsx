//   import { useState, useEffect } from "react";
//   import { Button } from "@/components/ui/button";
//   import { Card } from "@/components/ui/card";
//   import { StepIndicator } from "./wizard/StepIndicator";
//   import { Step1Identity } from "./wizard/steps/Step1Identity";
//   import { Step2Business } from "./wizard/steps/Step2Business";
//   import { Step3Experience } from "./wizard/steps/Step3Experience";
//   import { Step4Education } from "./wizard/steps/Step4Education";
//   import { Step5Skills } from "./wizard/steps/Step5Skills";
//   import { Step6Personality } from "./wizard/steps/Step6Personality";
//   import { Step7Story } from "./wizard/steps/Step7Story";
//   import { Step8Networking } from "./wizard/steps/Step8Networking";
//   import { Step9Links } from "./wizard/steps/Step9Links";
//   import { DigitalTwinProfile } from "@/types/digitalTwin";
//   import { ChevronLeft, ChevronRight, Download, Sparkles, Loader2, Crown, Building2, User } from "lucide-react";
//   import { toast } from "sonner";
//   import { useDigitalTwin } from "@/contexts/DigitalTwinContext";
//   import { useAuth } from "@/contexts/AuthContext";

//   const INITIAL_DATA: DigitalTwinProfile = {
//     identity: { name: "", role: "", tagline: "", bio: "" },
//     businesses: [{ name: "", role: "", description: "", link: "", products: [], duration: "" }],
//     experience: [{ company: "", role: "", duration: "", key_projects: [] }],
//     education: [{ institution: "", degree: "", year: "" }],
//     skills: {
//       list: [],
//       coreDomains: "",
//       signatureStrengths: "",
//     },
//     personality: {
//       traits: [],
//       leadership_style: "",
//       decision_style: "",
//       tone: "",
//       archetype: "",
//       values: [],
//     },
//     story: { mission: "", impact: "", themes: [] },
//     networking: { audience: "", intent: "", boundaries: [] },
//     links: { linkedin: "", website: "", portfolio: "", socials: [] },
//   };

//   const STEP_TITLES = [
//     "Identity",
//     "Business",
//     "Experience",
//     "Education",
//     "Skills",
//     "Personality",
//     "Story",
//     "Networking",
//     "Links",
//   ];

//   export const DigitalTwinWizard = () => {
//     const [currentStep, setCurrentStep] = useState(0);
//     const [data, setData] = useState<DigitalTwinProfile>(INITIAL_DATA);
//     const [showOutput, setShowOutput] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const { saveDigitalTwin, digitalTwin, loadDigitalTwin, isLoading } = useDigitalTwin();
//     const { user } = useAuth();

//     const totalSteps = 9;

//     const handleNext = async () => {
//       if (currentStep < totalSteps - 1) {
//         setCurrentStep(currentStep + 1);
//         window.scrollTo({ top: 0, behavior: "smooth" });
//       } else {
//         await handleComplete();
//       }
//     };
// useEffect(() => {
//   if (digitalTwin) {
//     // Remove backend-only fields (_id, createdAt, etc.) before loading into form
//     const { _id, isActive, createdAt, lastUpdated, ...profileData } = digitalTwin;

//     // Merge safely with initial structure to ensure no undefined sections
//     setData({
//       ...INITIAL_DATA,
//       ...profileData,
//     });
//   } else {
//     setData(INITIAL_DATA);
//   }
// }, [digitalTwin]);

//     const handleBack = () => {
//       if (currentStep > 0) {
//         setCurrentStep(currentStep - 1);
//         window.scrollTo({ top: 0, behavior: "smooth" });
//       }
//     };

//     const handleComplete = async () => {
//       setIsSaving(true);
//       try {
//         await saveDigitalTwin(data);
//         setShowOutput(true);
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         toast.success("Digital Twin Profile Complete!", {
//           description: "Your professional persona has been generated and saved.",
//         });
//       } catch (error) {
//         console.error('Failed to save digital twin:', error);
//       } finally {
//         setIsSaving(false);
//       }
//     };

//     const downloadJSON = () => {
//       const json = JSON.stringify(data, null, 2);
//       const blob = new Blob([json], { type: "application/json" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `digital-twin-${data.identity.name.replace(/\s+/g, "-").toLowerCase()}.json`;
//       a.click();
//       toast.success("Profile Downloaded", { description: "JSON file saved successfully." });
//     };

//     const generatePersona = () => {
//       const persona = `You are the digital twin of ${data.identity.name}, ${data.identity.role}${
//         data.businesses[0]?.name ? ` at ${data.businesses[0].name}` : ""
//       }.

//   ${data.identity.bio}

//   You understand their entire ecosystem including:
//   ${data.businesses.map((b) => `- ${b.name} (${b.role}): ${b.description}`).join("\n")}

//   Personality: ${data.personality.traits.join(", ")} | ${data.personality.tone} tone
//   Leadership: ${data.personality.leadership_style}
//   Values: ${data.personality.values.join(", ")}

//   Mission: ${data.story.mission}

//   You represent them professionally in conversations, staying authentic, strategic, and human.`;

//       return persona;
//     };

//     if (isLoading) {
//       return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
//           <div className="text-center space-y-4">
//             <div className="relative">
//               <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
//               <User className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
//             </div>
//             <div>
//               <h3 className="font-semibold text-lg text-foreground mb-2">Loading Your Digital Twin</h3>
//               <p className="text-muted-foreground">Preparing your professional persona...</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (showOutput) {
//       return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-12 px-4">
//           <div className="max-w-6xl mx-auto">
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mb-4">
//                 <Crown className="w-8 h-8 text-white" />
//               </div>
//               <h1 className="text-4xl font-bold text-foreground mb-3">Digital Twin Complete</h1>
//               <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//                 Your professional persona is ready to represent you in the digital world
//               </p>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <Card className="p-8 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
//                     <Sparkles className="w-5 h-5 text-primary" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-semibold text-foreground">AI Persona Initialization</h2>
//                     <p className="text-sm text-muted-foreground">Copy this prompt to initialize your AI assistant</p>
//                   </div>
//                 </div>
//                 <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
//                   {generatePersona()}
//                 </div>
//               </Card>

//               <Card className="p-8 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
//                     <Building2 className="w-5 h-5 text-secondary" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-semibold text-foreground">Complete Profile Data</h2>
//                     <p className="text-sm text-muted-foreground">Full JSON structure for integration</p>
//                   </div>
//                 </div>
//                 <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl overflow-auto max-h-96">
//                   <pre className="text-xs text-slate-700">{JSON.stringify(data, null, 2)}</pre>
//                 </div>
//               </Card>
//             </div>

//             <div className="flex gap-4 justify-center mt-8">
//               <Button 
//                 onClick={downloadJSON} 
//                 className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200"
//               >
//                 <Download className="w-5 h-5 mr-3" />
//                 Download JSON Profile
//               </Button>
//               <Button
//                 onClick={() => {
//                   setShowOutput(false);
//                   setCurrentStep(0);
//                 }}
//                 variant="outline"
//                 className="px-8 py-6 text-base font-semibold border-2 hover:bg-slate-50 transition-colors duration-200"
//               >
//                 Create Another Twin
//               </Button>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-12 px-4">
//         <div className="max-w-5xl mx-auto">
//           <div className="text-center mb-12">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-lg mb-6">
//               <User className="w-10 h-10 text-white" />
//             </div>
//             <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
//               Digital Twin Architect
//             </h1>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
//               Build an intelligent professional persona that speaks, thinks, and connects like you
//             </p>
            
//             {digitalTwin && (
//               <div className="mt-6 inline-flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl shadow-sm">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span className="text-green-700 font-medium text-sm">
//                   📋 Editing existing digital twin profile
//                 </span>
//               </div>
//             )}
//           </div>

//           <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl">
//             <StepIndicator currentStep={currentStep} totalSteps={totalSteps} stepTitles={STEP_TITLES} />

//             <div className="mt-12 mb-8">
//               {currentStep === 0 && (
//                 <Step1Identity data={data.identity} onChange={(identity) => setData({ ...data, identity })} />
//               )}
//               {currentStep === 1 && (
//                 <Step2Business data={data.businesses} onChange={(businesses) => setData({ ...data, businesses })} />
//               )}
//               {currentStep === 2 && (
//                 <Step3Experience data={data.experience} onChange={(experience) => setData({ ...data, experience })} />
//               )}
//               {currentStep === 3 && (
//                 <Step4Education data={data.education} onChange={(education) => setData({ ...data, education })} />
//               )}
//               {currentStep === 4 && (
//                 <Step5Skills data={data.skills} onChange={(skills) => setData({ ...data, skills })} />
//               )}
//               {currentStep === 5 && (
//                 <Step6Personality
//                   data={data.personality}
//                   onChange={(personality) => setData({ ...data, personality })}
//                 />
//               )}
//               {currentStep === 6 && <Step7Story data={data.story} onChange={(story) => setData({ ...data, story })} />}
//               {currentStep === 7 && (
//                 <Step8Networking
//                   data={data.networking}
//                   onChange={(networking) => setData({ ...data, networking })}
//                 />
//               )}
//               {currentStep === 8 && <Step9Links data={data.links} onChange={(links) => setData({ ...data, links })} />}
//             </div>

//             <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-200">
//               <Button 
//                 onClick={handleBack} 
//                 variant="outline" 
//                 disabled={currentStep === 0}
//                 className="px-6 py-3 h-auto font-semibold border-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors duration-200"
//               >
//                 <ChevronLeft className="w-5 h-5 mr-2" />
//                 Previous Step
//               </Button>
              
//               <div className="text-center flex-1 mx-8">
//                 <span className="text-sm font-medium text-muted-foreground">
//                   Step {currentStep + 1} of {totalSteps}
//                 </span>
//                 <div className="w-32 h-1 bg-slate-200 rounded-full mx-auto mt-2 overflow-hidden">
//                   <div 
//                     className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
//                     style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
//                   />
//                 </div>
//               </div>
              
//               <Button 
//                 onClick={handleNext} 
//                 className="px-8 py-3 h-auto font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isSaving}
//               >
//                 {isSaving ? (
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                 ) : currentStep === totalSteps - 1 ? (
//                   <>
//                     <Sparkles className="w-5 h-5 mr-2" />
//                     Complete Profile
//                   </>
//                 ) : (
//                   <>
//                     Next Step
//                     <ChevronRight className="w-5 h-5 ml-2" />
//                   </>
//                 )}
//               </Button>
//             </div>
//           </Card>

//           <div className="text-center mt-8">
//             <p className="text-sm text-muted-foreground">
//               Your data is securely stored and only used to generate your professional digital twin
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   };


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Step1Identity } from "./wizard/steps/Step1Identity";
import { Step2Business } from "./wizard/steps/Step2Business";
import { Step3Experience } from "./wizard/steps/Step3Experience";
import { Step4Education } from "./wizard/steps/Step4Education";
import { Step5Skills } from "./wizard/steps/Step5Skills";
import { Step6Personality } from "./wizard/steps/Step6Personality";
import { Step7Story } from "./wizard/steps/Step7Story";
import { Step8Networking } from "./wizard/steps/Step8Networking";
import { Step9Links } from "./wizard/steps/Step9Links";
import { DigitalTwinProfile } from "@/types/digitalTwin";
import { ChevronLeft, ChevronRight, Sparkles, Loader2, User, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { useDigitalTwin } from "@/contexts/DigitalTwinContext";
import { useNavigate } from "react-router-dom";
// Polished post-creation / post-edit screen. UX lives in SuccessScreen.tsx;
// the wizard only orchestrates the flow.
import { SuccessScreen } from "./wizard/SuccessScreen";

const INITIAL_DATA: DigitalTwinProfile = {
  identity: { name: "", role: "", tagline: "", bio: "" },
  businesses: [{ name: "", role: "", description: "", link: "", products: [], duration: "" }],
  experience: [{ company: "", role: "", duration: "", key_projects: [] }],
  education: [{ institution: "", degree: "", year: "" }],
  skills: {
    list: [],
    coreDomains: "",
    signatureStrengths: "",
  },
  personality: {
    traits: [],
    leadership_style: "",
    decision_style: "",
    tone: "",
    archetype: "",
    values: [],
  },
  story: { mission: "", impact: "", themes: [] },
  networking: { audience: "", intent: "", boundaries: [] },
  links: { linkedin: "", website: "", portfolio: "", socials: [] },
};

const STEP_TITLES = [
  "Identity",
  "Business",
  "Experience",
  "Education",
  "Skills",
  "Personality",
  "Story",
  "Networking",
  "Links",
];

// Responsive Step Indicator Component
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
}) => {
  return (
    <div className="w-full mb-6 sm:mb-8">
      {/* Current Step Info */}
      <div className="flex items-center justify-between mb-4 px-2 sm:px-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
            {stepTitles[currentStep]}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <span className="text-2xl sm:text-3xl font-bold text-primary">
            {currentStep + 1}
          </span>
          <span className="text-slate-400 text-lg sm:text-xl">/{totalSteps}</span>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-300 rounded-full ${
              index < currentStep
                ? "w-6 sm:w-8 lg:w-10 h-2 sm:h-2.5 bg-primary"
                : index === currentStep
                ? "w-8 sm:w-10 lg:w-12 h-2.5 sm:h-3 bg-gradient-to-r from-primary to-secondary shadow-md"
                : "w-4 sm:w-6 lg:w-8 h-2 sm:h-2.5 bg-slate-200"
            }`}
            title={stepTitles[index]}
          />
        ))}
      </div>

      {/* All Steps List (Desktop Only) */}
      <div className="hidden xl:grid grid-cols-9 gap-2 mt-6 pt-6 border-t border-slate-200">
        {stepTitles.map((title, index) => (
          <div
            key={index}
            className={`text-center transition-all duration-200 ${
              index === currentStep
                ? "scale-105"
                : index < currentStep
                ? "opacity-60"
                : "opacity-40"
            }`}
          >
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-semibold mb-2 ${
                index < currentStep
                  ? "bg-primary text-white"
                  : index === currentStep
                  ? "bg-gradient-to-r from-primary to-secondary text-white ring-2 ring-primary/30"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <span className="text-xs text-slate-600 font-medium line-clamp-2">
              {title}
            </span>
          </div>
        ))}
      </div>

      {/* Tablet View - Scrollable Steps */}
      <div className="hidden lg:block xl:hidden mt-6 pt-6 border-t border-slate-200">
        <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          <div className="flex items-center gap-3 min-w-max">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`flex flex-col items-center gap-2 transition-all duration-200 ${
                    index === currentStep ? "scale-105" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      index < currentStep
                        ? "bg-primary text-white"
                        : index === currentStep
                        ? "bg-gradient-to-r from-primary to-secondary text-white ring-2 ring-primary/30"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      index === currentStep
                        ? "text-slate-800"
                        : "text-slate-500"
                    }`}
                  >
                    {title}
                  </span>
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`h-0.5 w-8 transition-all duration-300 ${
                      index < currentStep ? "bg-primary" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DigitalTwinWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<DigitalTwinProfile>(INITIAL_DATA);
  const [showOutput, setShowOutput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // _id of the just-saved twin. Used so the success screen's "View Live
  // Twin" CTA can link to /chatbot/:id. Without this, we'd have to refetch
  // the twin list after creation just to find the id we already had in
  // the create response.
  const [savedTwinId, setSavedTwinId] = useState<string | undefined>(undefined);
  const { saveDigitalTwin, digitalTwin, isLoading } = useDigitalTwin();
  const navigate = useNavigate();

  const totalSteps = 9;

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      await handleComplete();
    }
  };

  useEffect(() => {
    if (digitalTwin) {
      const { _id, isActive, createdAt, lastUpdated, ...profileData } = digitalTwin;
      setData({
        ...INITIAL_DATA,
        ...profileData,
      });
    } else {
      setData(INITIAL_DATA);
    }
  }, [digitalTwin]);

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // saveDigitalTwin now returns the persisted twin (including _id) —
      // we stash that id so the success screen can link to /chatbot/:id
      // without an extra round-trip.
      const saved = await saveDigitalTwin(data);
      if (saved?._id) {
        setSavedTwinId(saved._id);
      }
      setShowOutput(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Tell the rest of the app the twin was saved so any cached
      // single-twin state (Dashboard context, header CTAs) can refresh.
      // Single window-event source of truth — no Redux/Query needed for
      // this small surface.
      window.dispatchEvent(new CustomEvent('twin:saved'));

      toast.success(
        digitalTwin ? "Net Twin Updated!" : "Net Twin Created!",
        {
          description: digitalTwin
            ? "Your changes have been saved successfully."
            : "Your professional persona has been generated and saved.",
        }
      );
    } catch (error) {
      console.error('Failed to save digital twin:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Note: downloadJSON and generatePersona used to live here. Both moved
  // into SuccessScreen.tsx along with the rest of the post-creation UX.

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] flex items-center justify-center px-4"
        role="status"
        aria-live="polite"
        aria-label="Loading wizard"
      >
        <div className="text-center space-y-4">
          {/* Centered spinner with icon center-stamped — kept this minimal
              because the wizard load is fast (single twin fetch) and a full
              skeleton of the form would be more distracting than the wait. */}
          <div className="relative inline-block">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-white mb-2">Loading Your Net Twin</h3>
            <p className="text-sm sm:text-base text-slate-300">Preparing your professional persona…</p>
          </div>
        </div>
      </div>
    );
  }

  if (showOutput) {
    // Polished post-save experience. UX lives in SuccessScreen.tsx; the
    // wizard just orchestrates the flow. "Edit Twin" pops back to step 1
    // with the current data still loaded so the user can revise.
    return (
      <SuccessScreen
        data={data}
        twinId={savedTwinId}
        onEditTwin={() => {
          setShowOutput(false);
          setCurrentStep(0);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] py-6 sm:py-8 lg:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Back to Dashboard</span>
          </button>
        </div>

        <div className="text-center mb-8 sm:mb-12 px-4">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-xl sm:rounded-2xl shadow-lg shadow-cyan-500/30 mb-4 sm:mb-6">
            <User className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent mb-3 sm:mb-4">
            Net Twin Architect
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Build an intelligent professional persona that speaks, thinks, and connects like you
          </p>
          
          {digitalTwin && (
            <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-teal-500/10 border border-teal-500/30 rounded-lg sm:rounded-xl shadow-sm">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-teal-300 font-medium text-xs sm:text-sm">
                📋 Editing existing net twin profile
              </span>
            </div>
          )}
        </div>

        {/* MAIN CARD WITH LIGHT INTERIOR */}
        <Card className="p-4 sm:p-6 lg:p-8 shadow-2xl border-0 bg-green-50 rounded-2xl sm:rounded-3xl">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} stepTitles={STEP_TITLES} />

          <div className="mt-8 sm:mt-12 mb-6 sm:mb-8">
            {currentStep === 0 && (
              <Step1Identity data={data.identity} onChange={(identity) => setData({ ...data, identity })} />
            )}
            {currentStep === 1 && (
              <Step2Business data={data.businesses} onChange={(businesses) => setData({ ...data, businesses })} />
            )}
            {currentStep === 2 && (
              <Step3Experience data={data.experience} onChange={(experience) => setData({ ...data, experience })} />
            )}
            {currentStep === 3 && (
              <Step4Education data={data.education} onChange={(education) => setData({ ...data, education })} />
            )}
            {currentStep === 4 && (
              <Step5Skills data={data.skills} onChange={(skills) => setData({ ...data, skills })} />
            )}
            {currentStep === 5 && (
              <Step6Personality
                data={data.personality}
                onChange={(personality) => setData({ ...data, personality })}
              />
            )}
            {currentStep === 6 && <Step7Story data={data.story} onChange={(story) => setData({ ...data, story })} />}
            {currentStep === 7 && (
              <Step8Networking
                data={data.networking}
                onChange={(networking) => setData({ ...data, networking })}
              />
            )}
            {currentStep === 8 && <Step9Links data={data.links} onChange={(links) => setData({ ...data, links })} />}
          </div>

          {/* Navigation Footer - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-200">
            {/* Previous Button */}
            <Button 
              onClick={handleBack} 
              variant="outline" 
              disabled={currentStep === 0}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 h-auto font-semibold border-2 border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700 transition-colors duration-200 text-sm sm:text-base order-2 sm:order-1"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Previous Step
            </Button>
            
            {/* Progress Indicator */}
            <div className="text-center w-full sm:flex-1 sm:mx-4 lg:mx-8 order-1 sm:order-2">
              <span className="text-xs sm:text-sm font-medium text-slate-600">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <div className="w-full sm:w-32 lg:w-40 h-1 bg-slate-200 rounded-full mx-auto mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Next/Complete Button */}
            <Button 
              onClick={handleNext} 
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 h-auto font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed border-0 text-sm sm:text-base order-3"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : currentStep === totalSteps - 1 ? (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Complete Profile
                </>
              ) : (
                <>
                  Next Step
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>

        <div className="text-center mt-6 sm:mt-8 px-4">
          <p className="text-xs sm:text-sm text-slate-400">
            Your data is securely stored and only used to generate your professional digital twin
          </p>
        </div>
      </div>
    </div>
  );
};