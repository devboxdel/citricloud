import ErrorPage from '../../components/ErrorPage';

export default function Error429() {
  return (
    <ErrorPage
      code={429}
      title="Too Many Requests"
      description="The user has sent too many requests in a given amount of time. Please wait a moment before making additional requests."
      category="Client Error"
      rfc="RFC 6585"
    />
  );
}
