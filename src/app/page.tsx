import ROUTES from "~/config/routes";
import { redirect } from "next/navigation";

const Home = () => {
  redirect(ROUTES.SIGN.ROOT());
};

export default Home;
