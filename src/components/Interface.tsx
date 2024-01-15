import { ReactNode } from 'react';

type InterfaceProps = {
  modelCount: number;
};

const Interface: React.FC<InterfaceProps> = ({ modelCount }): ReactNode => {
  return (
    <div className='absolute border rounded w-[300px] bg-white mt-4 ms-4 p-2'>
      <h3 className='p-2 text-black'>IFC Reader</h3>
      <div className='p-2 flex justify-between'>
        <span className='pt-2 pb-2'>Models loaded: {modelCount}</span>
      </div>
    </div>
  );
};

export default Interface;
