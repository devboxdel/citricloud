import ErrorPage from '../../components/ErrorPage';

export default function Error400() {
  return (
    <ErrorPage
      code={400}
      title="Bad Request"
      description="The server cannot or will not process the request due to an apparent client error such as malformed request syntax, invalid request message framing, or deceptive request routing."
      category="Client Error"
    />
  );
}
