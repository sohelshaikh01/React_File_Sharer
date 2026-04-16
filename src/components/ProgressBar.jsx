const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-800 h-2 rounded mt-3">
      <div
        className="bg-white h-2 rounded"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;