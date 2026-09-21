function LoadingState({ message = "Loading..." }) {
  return (
    <div role="status" className="analytics-panel">
      <p className="text-gray-300">{message}</p>
    </div>
  );
}

export default LoadingState;
