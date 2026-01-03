import ErrorPage from '../../components/ErrorPage';

export default function Error418() {
  return (
    <ErrorPage
      code={418}
      title="I'm a teapot"
      description="This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol. The server refuses to brew coffee because it is, permanently, a teapot. ☕"
      category="Client Error"
      rfc="RFC 2324, RFC 7168"
    />
  );
}
