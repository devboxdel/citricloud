import ErrorPage from '../../components/ErrorPage';

export default function Error504() {
  return (
    <ErrorPage
      code={504}
      title="Gateway Timeout"
      description="The server was acting as a gateway or proxy and did not receive a timely response from the upstream server. Please try again later."
      category="Server Error"
    />
  );
}
