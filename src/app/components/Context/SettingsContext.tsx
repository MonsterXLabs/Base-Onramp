'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface ISettingsContext {
  properties: any[] | null;
  setProperties: (data: any[] | null) => void;
  contacts: any[] | null;
  setContacts: (data: any[] | null) => void;
  shipping: any[] | null;
  setShipping: (data: any[] | null) => void;
}

interface SettingsProviderProps {
  children: ReactNode;
}

// create a settings context
const SettingsDetailContext = createContext<ISettingsContext | undefined>(
  undefined,
);

//context component
export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [properties, setProperties] = useState<any[] | null>(null);
  const [contacts, setContacts] = useState<any[] | null>(null);
  const [shipping, setShipping] = useState<any[] | null>(null);

  return (
    <SettingsDetailContext.Provider
      value={{
        properties,
        setProperties,
        contacts,
        setContacts,
        shipping,
        setShipping,
      }}
    >
      {children}
    </SettingsDetailContext.Provider>
  );
};

// hook
export const useSettingsDetail = () => {
  const context = useContext(SettingsDetailContext);
  if (context === undefined)
    throw new Error(
      'Settings Detail context must be used within Settings Detail Provider',
    );
  return context;
};
