function ErrorState({ message }) {
  return (
    <div role="alert" className="analytics-panel border-red-900/60">
      <p className="font-medium text-red-400">{message}</p>
    </div>
  );
}

export default ErrorState;
