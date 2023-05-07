//@OnlyCurrentDoc

const SHEET = SpreadsheetApp.getActive().getSheetByName('meals');
const RANGE = SHEET.getDataRange();
const ALL_DATA = RANGE.getValues();

ALL_DATA.shift();

const MAX_EFFORT = 5;


function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Pick Meals')
      .addItem('Pick two random complementary meals', 'pickTwoMeals')
      .addItem('Show options for selected meal', 'showOptionsForSelected')
      .addItem('Clear filter', 'clearFilter')
      .addToUi();
}


function clearFilter() {
  RANGE.setBackground(null);

  const filter = SHEET.getFilter()

  if (filter) {
    filter.remove();
  }
}


function createFilter(visibleRows) {
  clearFilter();

  const visibleValues = visibleRows.map(row => row[0]);
  let dataExclusions = ALL_DATA.map(row => row[0]);
  dataExclusions = dataExclusions.filter(meal => !visibleValues.includes(meal));

  const criteria = SpreadsheetApp.newFilterCriteria().setHiddenValues(dataExclusions).build();

  filter = RANGE.createFilter();
  filter.setColumnFilterCriteria(1, criteria);
}


function getComplementaryOptionsForMeal(choiceA) {
  let data = [...ALL_DATA];

  // filter out same types
  const types = choiceA[1].split(' ');

  data = data.filter((meal) => {
    const other_types = meal[1].split(' ');
    const intersection = other_types.filter(t => types.includes(t));

    if (intersection.length) {
      return false;
    }

    if (choiceA[2] + meal[2] > MAX_EFFORT) {
      return false;
    }

    if (choiceA[3] === 'n' && meal[3] === 'n') {
      return false;
    }

    return true;
  })

  return data;
}


function pickTwoMeals() {
  const choiceA = ALL_DATA[Math.floor(Math.random() * ALL_DATA.length)];
  const options = getComplementaryOptionsForMeal(choiceA);

  const choiceB = options[Math.floor(Math.random() * options.length)];

  createFilter([choiceA, choiceB]);
}


function showOptionsForSelected() {
  const selectedRowIndex = SHEET.getSelection().getCurrentCell().getRowIndex();
  const newRange = SHEET.getRange(`A${selectedRowIndex}:D${selectedRowIndex}`);
  newRange.activate();

  const choice = newRange.getValues()[0];
  const options = getComplementaryOptionsForMeal(choice);

  createFilter([choice, ...options]);

  newRange.setBackgroundRGB(255, 255, 224);
}
