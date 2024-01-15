import { ReactNode, createContext, useState } from 'react';

type ModelsContextProps = {
  urlModel: string;
  setUrlModel: (value: string) => void;
};

type ModelsProviderProps = {
  children: ReactNode;
};

export const ModelsContext = createContext<ModelsContextProps>({
  urlModel: '',
  setUrlModel: () => {},
});

export const ModelsProvider: React.FC<ModelsProviderProps> = ({ children }) => {
  const [urlModel, setUrlModel] = useState(
    // 'https://glasshouseclientfiles.s3.eu-central-1.amazonaws.com/temp/TestingIFCModel/Architecture_Model_Glass+House+-+Philip+Johnson.ifc'
    // 'https://glasshouseclientfiles.s3.eu-central-1.amazonaws.com/temp/TestingIFCModel/CHR_K01_F3_LAB_N001.ifc'
    ''
  );

  const value = {
    urlModel,
    setUrlModel,
  };

  return (
    <ModelsContext.Provider value={value}>{children}</ModelsContext.Provider>
  );
};
