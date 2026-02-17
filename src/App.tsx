import { StrictMode, useState, useEffect, lazy } from "react";
import { createRoot } from "react-dom/client";

import {
  ChakraProvider,
  Box,
  Container,
  Heading,
  Flex,
  defaultSystem,
  DialogRoot,
  DialogTrigger,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
} from "@chakra-ui/react";

const LazyWheel = lazy(() =>
  import("./Wheel").then((module) => ({ default: module.Wheel }))
);
const LazyNameEntries = lazy(() =>
  import("./NameEntries").then((module) => ({ default: module.NameEntries }))
);

import "./index.css";
import "./fireworks.css";
import "./snow.css";

// Snow effect component for Christmas Eve
function SnowEffect() {
  const snowflakes = Array.from({ length: 50 }, (_, i) => (
    <div key={i} className="snowflake">
      ❄
    </div>
  ));

  return <div className="snowfall">{snowflakes}</div>;
}

// Check if today is Christmas Eve (December 24th)
function isChristmasEve(): boolean {
  const today = new Date();
  return today.getMonth() === 11 && today.getDate() === 24;
}

function App() {
  const initialHeaderText =
    localStorage.getItem("header-text") || "🎡 Wheel of Names";
  const [names, setNames] = useState<string[]>([]);
  const [shuffleNames, setShuffleNames] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [headerText, setHeaderText] = useState<string>(initialHeaderText);
  const [excludedNames, setExcludedNames] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem("excluded-names") || "[]"))
  );

  useEffect(() => {
    updateHeaderText(initialHeaderText);
  }, []);

  const removeWinnerFromWheel = () => {
    if (winner) {
      const updatedNames = names.filter((name) => name !== winner);
      setNames(updatedNames);

      localStorage.setItem("wheel-names", JSON.stringify(updatedNames));

      // Update the textarea content
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.value = updatedNames.join("\n");
      }
      setWinner(null);
      setIsDialogOpen(false);
    }
  };

  const announceWinner = (name: string) => {
    setWinner(name);
    setIsDialogOpen(true);

    // Create fireworks container
    const pyroContainer = document.createElement("div");
    pyroContainer.className = "pyro";

    // Create before and after elements
    const beforeElement = document.createElement("div");
    beforeElement.className = "before";
    const afterElement = document.createElement("div");
    afterElement.className = "after";

    pyroContainer.appendChild(beforeElement);
    pyroContainer.appendChild(afterElement);

    // Append to the DOM
    document.body.appendChild(pyroContainer);

    // Remove after animation
    setTimeout(() => {
      if (document.body.contains(pyroContainer)) {
        document.body.removeChild(pyroContainer);
      }
    }, 4000); // Remove fireworks after 5 seconds
  };

  const handleShuffle = () => {
    if (shuffleNames) {
      const shuffled = [...names].sort(() => Math.random() - 0.5);
      setNames(shuffled);
    }
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeaderText = e.target.value;
    updateHeaderText(newHeaderText);
  };

  const pickRandomHeader = () => {
    const randomHeaders = [
      "🎯 Today’s Chosen One: Luck or Chaos?",
      "🐸 Fate Has Spoken (Kinda)",
      "🤡 Wheel of Fortunate-ish",
      "🍕 Spin It to Win… Bragging Rights",
      "🦄 The Universe Decides (No Refunds)",
      "🫣 One Spin to Rule Them All",
      "🎲 Destiny? Or Just Dumb Luck?",
      "🐔 Cluck of the Draw",
      "🛸 Beamed Up by Luck Today?",
      "🧃 Winner Gets Nothing But Vibes",
    ];

    const randomHeader =
      randomHeaders[Math.floor(Math.random() * randomHeaders.length)];
    updateHeaderText(randomHeader);
  };

  const updateHeaderText = (newHeaderText: string) => {
    setHeaderText(newHeaderText);
    localStorage.setItem("header-text", newHeaderText);
    document.title = newHeaderText;
  };

  return (
    <>
      {isChristmasEve() && <SnowEffect />}
      <Box as="main" minH="100vh">
        <Container maxW="container.xl" py={6}>
          <Heading
            mt={10}
            mb={10}
            textAlign="center"
            fontSize="3xl"
            fontWeight="bold"
            bgGradient="linear(to-r, blue.600, purple.500, pink.500)"
            bgClip="text"
            color="black"
          >
            {headerText}
          </Heading>

          <Flex width="full" direction={{ base: "column", md: "row" }} gap={4}>
            <Box width={{ base: "100%", md: "60%" }} mb={{ base: 6, md: 0 }}>
              <LazyWheel
                names={names}
                setNames={setNames}
                onShuffle={handleShuffle}
                onSelectWinner={(name: string) => announceWinner(name)}
                excludedNames={excludedNames}
              />
            </Box>
            <Box width={{ base: "100%", md: "40%" }}>
              <LazyNameEntries
                names={names}
                setNames={setNames}
                headerText={headerText}
                setHeaderText={handleHeaderChange}
                pickRandomHeader={pickRandomHeader}
                excludedNames={excludedNames}
                setExcludedNames={setExcludedNames}
              />
            </Box>
          </Flex>
        </Container>
      </Box>

      <DialogRoot open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger />
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent>
            <DialogCloseTrigger />
            <DialogHeader>
              <DialogTitle>Winner Announcement</DialogTitle>
            </DialogHeader>
            <DialogBody>🎉 Winner: {winner}! 🎉</DialogBody>
            <DialogFooter>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="ghost"
                background="transparent"
              >
                Close
              </Button>
              <Button
                bg="#EAEAEA"
                color="#333333"
                borderRadius="4px"
                _hover={{ bg: "#CCCCCC" }}
                onClick={removeWinnerFromWheel}
                ml={3}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  </StrictMode>
);
