"use client";
import { Box, Button, Card, Flex, Separator, Text } from "@radix-ui/themes";
import ThemeIcon from "./theme-icon";
import Logo from "./logo";
import { usePathname } from "next/navigation";
import ROUTES from "~/config/routes";
import { useMemo } from "react";
import Link from "next/link";

const Navbar = () => {
  const pathname = usePathname();

  const isSign = useMemo(() => pathname === ROUTES.SIGN.ROOT(), [pathname]);
  const isPasswordChange = useMemo(
    () => pathname === ROUTES.PASSWORD_CHANGE.ROOT(),
    [pathname]
  );

  return (
    <Box className="sticky top-0 z-40 w-full">
      <Card asChild size="2" className="no-radius">
        <header>
          <Flex
            px={{
              initial: "2",
              sm: "4",
            }}
            mx="0"
            align="center"
          >
            <Logo />
            <Text mt="4" ml="1" as="span" weight="light" size="1">
              Lite
            </Text>
            <Separator orientation="vertical" ml="5" />
            <Flex width="100%" align="center" justify="end">
              <Flex asChild align="center" mx="2">
                <nav>
                  <Button
                    asChild
                    mx="4"
                    variant="ghost"
                    color={isSign ? "blue" : "gray"}
                  >
                    <Link href={ROUTES.SIGN.ROOT()}>Firmar</Link>
                  </Button>
                  <Button
                    asChild
                    mx="4"
                    variant="ghost"
                    color={isPasswordChange ? "blue" : "gray"}
                  >
                    <Link href={ROUTES.PASSWORD_CHANGE.ROOT()}>
                      Cambio de contraseña
                    </Link>
                  </Button>
                </nav>
              </Flex>
              <ThemeIcon
                ml="auto"
                mx="2"
                size="3"
                variant="ghost"
                color="gray"
              />
            </Flex>
          </Flex>
        </header>
      </Card>
    </Box>
  );
};

export default Navbar;
