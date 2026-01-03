import ErrorPage from '../../components/ErrorPage';

export default function Error401() {
  return (
    <ErrorPage
      code={401}
      title="Unauthorized"
      description="Authentication is required and has failed or has not yet been provided. Please log in to access this resource."
      category="Client Error"
    />
  );
}
