import ErrorPage from '../../components/ErrorPage';

export default function Error500() {
  return (
    <ErrorPage
      code={500}
      title="Internal Server Error"
      description="A generic error message, given when an unexpected condition was encountered and no more specific message is suitable. Our team has been notified and is working to resolve the issue."
      category="Server Error"
    />
  );
}
