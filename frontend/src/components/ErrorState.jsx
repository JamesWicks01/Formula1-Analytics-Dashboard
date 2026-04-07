function ErrorState({ message }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <p className="font-medium text-red-600">{message}</p>
    </div>
  );
}

export default ErrorState;