import ErrorPage from '../../components/ErrorPage';

export default function Error404() {
  return (
    <ErrorPage
      code={404}
      title="Not Found"
      description="The requested resource could not be found but may be available in the future. Subsequent requests by the client are permissible."
      category="Client Error"
    />
  );
}
