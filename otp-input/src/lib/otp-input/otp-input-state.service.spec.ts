import { OtpInputState } from './otp-input-state.service';

describe(OtpInputState.name, () => {
  let service: OtpInputState;

  beforeEach(() => {
    service = new OtpInputState();
  });

  it('should append filled characters', () => {
    const expected = ['a', 'b', 'c'];
    service.initialize(3);
    expected.forEach((char) => service.pushCharacter(char));

    expect(service.filledCharacters()).toEqual(expected);
  });

  it('should replace the last character when pushing over the code length', () => {
    const expected = ['a', 'b', 'c'];
    service.initialize(3);
    expected.forEach((char) => service.pushCharacter(char));

    service.pushCharacter('d');
    expect(service.filledCharacters()).toEqual(['a', 'b', 'd']);
  });

  it('should pop filled characters', () => {
    const chars = ['a', 'b', 'c'];
    service.initialize(3);
    chars.forEach((char) => service.pushCharacter(char));

    expect(service.popCharacter()).toEqual('c');
    expect(service.popCharacter()).toEqual('b');
    expect(service.popCharacter()).toEqual('a');
    expect(service.filledCharacters()).toEqual([]);
  });

  it('should replace a character', () => {
    const chars = ['a', 'b', 'c'];
    service.initialize(3);
    chars.forEach((char) => service.pushCharacter(char));

    service.replaceCharacter('x', 1);
    expect(service.filledCharacters()).toEqual(['a', 'x', 'c']);
  });

  it('should remove a character by index', () => {
    const chars = ['a', 'b', 'c'];
    service.initialize(3);
    chars.forEach((char) => service.pushCharacter(char));

    service.removeCharacterAtIndex(1);
    expect(service.filledCharacters()).toEqual(['a', 'c']);
    service.removeCharacterAtIndex(0);
    expect(service.filledCharacters()).toEqual(['c']);
  });

  it('should clear all characters', () => {
    const chars = ['a', 'b', 'c'];
    service.initialize(3);
    chars.forEach((char) => service.pushCharacter(char));

    service.clear();
    expect(service.filledCharacters()).toEqual([]);
  });

  it('should focus the correct cell', () => {
    const chars = ['a', 'b'];
    service.initialize(3);
    chars.forEach((char) => service.pushCharacter(char));

    service.focusInputCell();
    expect(service.selectedInputCell()).toEqual(2);

    service.pushCharacter('z');
    expect(service.selectedInputCell()).toEqual(2);
  });
});
