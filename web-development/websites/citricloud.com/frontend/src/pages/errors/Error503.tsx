import ErrorPage from '../../components/ErrorPage';

export default function Error503() {
  return (
    <ErrorPage
      code={503}
      title="Service Unavailable"
      description="The server is currently unavailable (because it is overloaded or down for maintenance). This is generally a temporary state."
      category="Server Error"
    />
  );
}
