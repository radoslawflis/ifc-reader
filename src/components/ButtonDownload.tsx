type ButtonDownloadProps = {
  handleDownload: () => void;
  downloadJsonEnabled: boolean;
};

const ButtonDownload = ({
  handleDownload,
  downloadJsonEnabled,
}: ButtonDownloadProps) => {
  return (
    <div className='relative'>
      <button
        onClick={handleDownload}
        disabled={!downloadJsonEnabled}
        className='absolute right-0 top-0 me-4 mt-4 p-2 text-white bg-grey shadow-md rounded w-[235px] '
      >
        Download Properties
      </button>
    </div>
  );
};

export default ButtonDownload;
