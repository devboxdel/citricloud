import ErrorPage from '../../components/ErrorPage';

export default function Error502() {
  return (
    <ErrorPage
      code={502}
      title="Bad Gateway"
      description="The server was acting as a gateway or proxy and received an invalid response from the upstream server. Please try again in a few moments."
      category="Server Error"
    />
  );
}
