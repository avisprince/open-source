export default function sleep(milliseconds: number): Promise<void> {
  return new Promise(res => setTimeout(res, milliseconds));
}
