import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import SamplePage from "../../src/app/sample/page";

test("SamplePage", () => {
    render(<SamplePage />);
    expect(
        screen.getByRole("heading", { level: 1, name: "Home" })
    ).toBeDefined();
});
