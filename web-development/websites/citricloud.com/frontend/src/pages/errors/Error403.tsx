import ErrorPage from '../../components/ErrorPage';

export default function Error403() {
  return (
    <ErrorPage
      code={403}
      title="Forbidden"
      description="The request was valid, but the server is refusing action. You might not have the necessary permissions for this resource."
      category="Client Error"
    />
  );
}
