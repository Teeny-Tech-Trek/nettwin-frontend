// import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { useToast } from '@/hooks/use-toast';
// import { useAuth } from './AuthContext';
// import { DigitalTwinProfile } from '@/types/digitalTwin';

// interface DigitalTwinContextType {
//   digitalTwin: DigitalTwinProfile | null;
//   isLoading: boolean;
//   saveDigitalTwin: (data: DigitalTwinProfile) => Promise<void>;
//   loadDigitalTwin: () => Promise<void>;
//   updateSection: (section: string, data: any) => Promise<void>;
//   deleteTwin: () => Promise<void>;
// }

// const DigitalTwinContext = createContext<DigitalTwinContextType | undefined>(undefined);

// export const useDigitalTwin = () => {
//   const context = useContext(DigitalTwinContext);
//   if (context === undefined) {
//     throw new Error('useDigitalTwin must be used within a DigitalTwinProvider');
//   }
//   return context;
// };

// interface DigitalTwinProviderProps {
//   children: ReactNode;
// }

// export const DigitalTwinProvider: React.FC<DigitalTwinProviderProps> = ({ children }) => {
//   const [digitalTwin, setDigitalTwin] = useState<DigitalTwinProfile | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();
//   const { token } = useAuth();

// const API_BASE_URL = `https://api.digitaltwin.techtrekkers.ai/api/digital-twin`;


//   const saveDigitalTwin = async (data: DigitalTwinProfile) => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/create`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to save digital twin');
//       }

//       const result = await response.json();
//       setDigitalTwin(result.data);

//       toast({
//         title: 'Success!',
//         description: 'Your digital twin has been saved successfully.',
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Save failed',
//         description: error.message || 'An unexpected error occurred',
//         variant: 'destructive',
//       });
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadDigitalTwin = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/get`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         if (response.status === 404) {
//           setDigitalTwin(null);
//           return;
//         }
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to load digital twin');
//       }

//       const result = await response.json();
//       setDigitalTwin(result.data);
//     } catch (error: any) {
//       console.error('Load digital twin error:', error);
//       toast({
//         title: 'Load failed',
//         description: error.message || 'Failed to load digital twin',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const updateSection = async (section: string, data: any) => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/update/${section}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update section');
//       }

//       const result = await response.json();
//       setDigitalTwin(result.data);

//       toast({
//         title: 'Updated!',
//         description: `${section} section updated successfully.`,
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Update failed',
//         description: error.message || 'An unexpected error occurred',
//         variant: 'destructive',
//       });
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteTwin = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/delete`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to delete digital twin');
//       }

//       setDigitalTwin(null);

//       toast({
//         title: 'Success!',
//         description: 'Digital twin deleted successfully.',
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Delete failed',
//         description: error.message || 'An unexpected error occurred',
//         variant: 'destructive',
//       });
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const value = {
//     digitalTwin,
//     isLoading,
//     saveDigitalTwin,
//     loadDigitalTwin,
//     updateSection,
//     deleteTwin,
//   };

//   return (
//     <DigitalTwinContext.Provider value={value}>
//       {children}
//     </DigitalTwinContext.Provider>
//   );
// };

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DigitalTwinProfile } from '@/types/digitalTwin';
import { digitalTwinService } from '@/services/api.service';

interface DigitalTwinContextType {
  digitalTwin: DigitalTwinProfile | null;
  isLoading: boolean;
  // Returns the saved twin (including its server-assigned `_id`) so the
  // caller can use it immediately — e.g. the wizard's success screen
  // needs the id to build the public "View Live Twin" link without
  // waiting for the next render cycle.
  saveDigitalTwin: (data: DigitalTwinProfile) => Promise<DigitalTwinProfile | null>;
  loadDigitalTwin: () => Promise<void>;
  updateSection: (section: string, data: any) => Promise<void>;
  // Single-twin-per-user model — there's only ever one twin to delete.
  deleteTwin: () => Promise<void>;
}

const DigitalTwinContext = createContext<DigitalTwinContextType | undefined>(undefined);

export const useDigitalTwin = () => {
  const context = useContext(DigitalTwinContext);
  if (context === undefined) {
    throw new Error('useDigitalTwin must be used within a DigitalTwinProvider');
  }
  return context;
};

interface DigitalTwinProviderProps {
  children: ReactNode;
}

export const DigitalTwinProvider: React.FC<DigitalTwinProviderProps> = ({ children }) => {
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwinProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveDigitalTwin = async (data: DigitalTwinProfile) => {
    setIsLoading(true);
    try {
      const result = await digitalTwinService.create(data);
      setDigitalTwin(result.data);

      toast({
        title: 'Success!',
        description: 'Your net twin has been saved successfully.',
      });
      // Hand the saved doc (with server-assigned _id) back to the caller.
      // The wizard uses this to populate the success screen's "View Live"
      // link without a redundant /get call.
      return result.data as DigitalTwinProfile;
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.response?.data?.message || error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadDigitalTwin = async () => {
    setIsLoading(true);
    try {
      const result = await digitalTwinService.get();
      setDigitalTwin(result.data);
    } catch (error: any) {
      // Handle 404 - no digital twin exists yet
      if (error.response?.status === 404) {
        setDigitalTwin(null);
        return;
      }
      
      console.error('Load net twin error:', error);
      toast({
        title: 'Load failed',
        description: error.response?.data?.message || error.message || 'Failed to load digital twin',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSection = async (section: string, data: any) => {
    setIsLoading(true);
    try {
      const result = await digitalTwinService.updateSection(section, data);
      setDigitalTwin(result.data);

      toast({
        title: 'Updated!',
        description: `${section} section updated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTwin = async () => {
    setIsLoading(true);
    try {
      await digitalTwinService.delete();
      setDigitalTwin(null);

      // Tell the rest of the app a twin was deleted so any cached state
      // (Dashboard CTAs, edit-vs-create decision) refreshes immediately.
      window.dispatchEvent(new CustomEvent('twin:saved'));

      toast({
        title: 'Success!',
        description: 'Your net twin has been deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.message || error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    digitalTwin,
    isLoading,
    saveDigitalTwin,
    loadDigitalTwin,
    updateSection,
    deleteTwin,
  };

  return (
    <DigitalTwinContext.Provider value={value}>
      {children}
    </DigitalTwinContext.Provider>
  );
};