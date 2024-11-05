import { computed, Injectable, signal } from '@angular/core';

@Injectable()
export class OtpInputState {
  private charactersLength = 0;

  public readonly selectedInputCell = signal<number | undefined>(undefined);

  public readonly filledCharacters = signal<string[]>([]);

  public readonly isDisabled = signal(false);

  public readonly filledCharactersAsString = computed(() =>
    this.filledCharacters().join(''),
  );

  public initialize(codeLength: number) {
    this.charactersLength = codeLength;
    this.clear();
  }

  public focusInputCell() {
    this.selectedInputCell.set(
      Math.min(this.filledCharacters().length, this.charactersLength - 1),
    );
  }

  public focusNextCell() {
    this.selectedInputCell.update((currentIndex) => {
      if (currentIndex === this.charactersLength - 1) {
        return currentIndex;
      }

      return (currentIndex ?? 0) + 1;
    });
  }

  public pushCharacter(char: string) {
    const filledChars = [...this.filledCharacters()];
    const newCharArray = filledChars;

    if (this.filledCharacters().length < this.charactersLength) {
      newCharArray.push(char);
    } else {
      newCharArray[newCharArray.length - 1] = char;
    }

    this.filledCharacters.set(newCharArray);
    this.focusInputCell();
  }

  public replaceCharacter(char: string, index: number) {
    const filledChars = [...this.filledCharacters()];
    const newCharArray = filledChars;

    if (newCharArray[index]) {
      newCharArray[index] = char;
    }

    this.filledCharacters.set(newCharArray);
  }

  public popCharacter(): string | undefined {
    const newCharArray = [...this.filledCharacters()];
    const char = newCharArray.pop();
    this.filledCharacters.set(newCharArray);
    this.focusInputCell();
    return char;
  }

  public removeCharacterAtIndex(index: number) {
    const newCharArray = [...this.filledCharacters()];
    newCharArray.splice(index, 1);
    this.filledCharacters.set(newCharArray);
  }

  public toggleDisabled(state: boolean) {
    this.isDisabled.set(state);
  }

  public clear() {
    this.filledCharacters.set([]);
  }
}
