type Props = {
  message: string;
}

export const GameStatus = (props: Props) => {
  return <p role="status" aria-atomic="true">{props.message}</p>;
};
