function LoadingState({ message = "Loading..." }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <p className="text-gray-700">{message}</p>
    </div>
  );
}

export default LoadingState;