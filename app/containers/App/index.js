import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import injectSaga from 'utils/injectSaga';
import { createStructuredSelector } from 'reselect';
import _debounce from 'lodash/debounce';
import {
  Message,
  Icon,
  Label,
  Input,
  Dropdown,
  Button,
  Form
} from 'semantic-ui-react';
import CurrBlock from 'components/CurrBlock';
import saga from './saga';
import { loadExchangeRate } from './actions';
import {
  makeSelectExchangeRateData,
  makeSelectExchangeRateError,
  makeSelectExchangeRateLoaded,
  makeSelectExchangeRateLoading,
} from './selectors';


import GlobalStyle from '../../global-styles';

const AppWrapper = styled.div`
  
  width: 100%;
  height: 100%;
  margin: 0;
  display: block;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
     width: 100%;
    max-width: 480px;
    margin: 20px auto;
    padding: 20px;
    border: 3px solid #e03997;
    border-radius: 6px;
`;
const Header = styled.div`
  position: sticky;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 10px 0;
`;

const BaseCurrencyInput = styled(Input)`
    position: sticky;
    border: 2px solid #e03997;
    padding: 10px;
    width: 100%;
    border-radius: 2px;
    font-weight:bold;
    input {
      text-align: right !important;
      border: none !important;
      font-size:1.2em;
      font-weight:bold;
    }
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
`;
const ContentWrapper = styled.div`
  width: 100%;
    max-height: 75vh;
    overflow: scroll;
    padding: 2px;
    background: transparent;
    margin-top: 15px;
`;
const SubmitCurrencyWrapper = styled.div`
  position: relative;
  width: 100%;
  margin: 0px auto 25px auto;
  display: flex;
`;

const ButtonAddWrapper = styled.div`
  position: relative;
`;

const CustomDropdown = styled(Dropdown)`
  width: 60%;
  float:left;
  margin-right:10px;
`;
const CustomDropdownButton = styled(Button)`
  width: 40%;
  min-width: 40%;
  @media (min-width: 768px) {
    width: 15%;
  }
`;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      baseCurrency: 'USD',
      baseNumber: parseFloat(10.0),
      displayedCurrency: [],
      showInputCurr: true,
      showAddCurr: false
    };
    this.contentWrapperRef = React.createRef();
    this.handleOpenCurrInput = this.handleOpenCurrInput.bind(this);
    this.handleAddCurr = this.handleAddCurr.bind(this);
  }

  handleOpenCurrInput() {

    var destCurr = document.getElementById("destCurr");
    if(destCurr.getAttribute("data-status") == "hide"){
      destCurr.setAttribute("data-overide", "showInputCurr");
      document.getElementById("addCurr").setAttribute("data-overide", "hideAddCurr");
    }
    
    this.setState(state => ({
      showInputCurr: !state.showInputCurr,
      showAddCurr: !state.showAddCurr
    }));
  }

  handleAddCurr() {
    this.setState(state => ({
      showAddCurr: !state.showAddCurr
    }));
  }

  componentDidMount() {
    this.getExchangeRate();
  }

  componentDidUpdate(prevProps) {
    const { exchangeRateData } = this.props;
    if (prevProps.exchangeRateData !== exchangeRateData) {
      this.updateDisplayedCurrency();
    }
  }

  getExchangeRate() {
    const { baseCurrency } = this.state;
    this.props.loadExchangeRate({ base: baseCurrency });
  }

  handleBaseNumberChanges = _debounce((e, data) => {
    const { value } = data;
    this.setState({
      baseNumber: Math.abs(parseFloat(value)),
    });
  }, 25);

  handleBaseCurrencyChanges = (e, data) => {
    const { value } = data;
    const { baseCurrency } = this.state;
    if (value !== baseCurrency) {
      this.setState(
        {
          baseCurrency: value,
        },
        () => this.props.loadExchangeRate({ base: this.state.baseCurrency }),
      );
    }
  };

  handleTargetCurrencyChanges = (e, data) => {
    const { value } = data;
    this.setState({
      targetCurrency: value,
    });

  };

  submitCurrency = () => {
    const { displayedCurrency, targetCurrency } = this.state;
    const { exchangeRateData } = this.props;
    const isCurrencyExist = displayedCurrency.find(
      item => item.currency === targetCurrency,
    );

    if (targetCurrency && !isCurrencyExist) {
      this.setState(
        {
          displayedCurrency: [
            ...displayedCurrency,
            {
              currency: targetCurrency,
              rates: exchangeRateData.rates[targetCurrency],
            },
          ],
        },
        () => this.scrollDownContentWrapper(),
      );

       var currencyBox = document.getElementsByClassName("currencyBox");
            // console.log(currencyBox.length);
            if (currencyBox.length < 0) {
              document.getElementById("destCurr").setAttribute("data-status", "show");
              document.getElementById("addCurr").setAttribute("data-status", "hide");
              document.getElementById("destCurr").removeAttribute("data-overide");
              document.getElementById("addCurr").removeAttribute("data-overide");

            } else {
              document.getElementById("destCurr").setAttribute("data-status", "hide");
              document.getElementById("destCurr").removeAttribute("data-overide");
              document.getElementById("addCurr").setAttribute("data-status", "show");
              document.getElementById("addCurr").removeAttribute("data-overide");
            }
    }
  };

  removeCurrency = targetCurrency => {
    const { displayedCurrency } = this.state;
    const newDisplayedCurrency = displayedCurrency.filter(
      item => item.currency !== targetCurrency,
    );
    this.setState({
      displayedCurrency: newDisplayedCurrency,
    });


      var currencyBox = document.getElementsByClassName("currencyBox");
      // console.log(currencyBox.length);
      if (currencyBox.length <= 1) {
        document.getElementById("destCurr").setAttribute("data-status", "show");
        document.getElementById("addCurr").setAttribute("data-status", "hide");
      } else {
        document.getElementById("destCurr").setAttribute("data-status", "hide");
        document.getElementById("addCurr").setAttribute("data-status", "show");
      }


  };

  updateDisplayedCurrency = () => {
    const { displayedCurrency } = this.state;
    const { exchangeRateData } = this.props;
    let newDisplayedCurrency = [];
    if (displayedCurrency && displayedCurrency.length > 0) {
      displayedCurrency.map(item => {
        newDisplayedCurrency = [
          ...newDisplayedCurrency,
          {
            currency: item.currency,
            rates: exchangeRateData.rates[item.currency],
          },
        ];
        return true;
      });
      this.setState({
        displayedCurrency: newDisplayedCurrency,
      });


    }

    
  };

  scrollDownContentWrapper = () => {
    this.contentWrapperRef.current.scrollTop = this.contentWrapperRef.current.scrollHeight;
  };


  
  
  

  generateContent = () => {
    const { intl } = this.props;
    const { displayedCurrency, baseNumber, baseCurrency, SubmitCurrencyWrapper } = this.state;
    let renderedItem = null;
    if (displayedCurrency && displayedCurrency.length > 0) {
      renderedItem = displayedCurrency.map(item => (
        <CurrBlock
          key={item.currency}
          item={item}
          baseNumber={baseNumber}
          baseCurrency={baseCurrency}
          onRemoveCurrency={this.removeCurrency}
        />

      ));
    } else {
      renderedItem = (
        <div align="left">
          <Message.Header>
            {intl.formatMessage({ id: 'general.currencypick' })}
          </Message.Header>
        </div>

      );
    }
    return renderedItem;
  };

  render() {
    const {
      intl,
      exchangeRateLoading,
      exchangeRateData,
      exchangeRateLoaded,
    } = this.props;
    const { baseCurrency, baseNumber } = this.state;
    return (
      <AppWrapper>
          <Header as='h1' color='pink'>
            {intl.formatMessage({ id: 'general.converter.title' })}
          </Header>
        
        <div align="left">
          <Message.Header>
            {intl.formatMessage({ id: 'general.currency.label.choose' })}
          </Message.Header>
        </div>
        <BaseCurrencyInput
          type="number"
          step="any"
          action={
            <Dropdown
              scrolling
              loading={exchangeRateLoading}
              value={baseCurrency}
              options={
                exchangeRateLoaded && exchangeRateData
                  ? exchangeRateData.currencyList
                  : []
              }
              onChange={this.handleBaseCurrencyChanges}
            />
          }
          actionPosition="left"
          value={typeof baseNumber === 'number' ? baseNumber : ''}
          onChange={this.handleBaseNumberChanges}
        />
        
          <ContentWrapper ref={this.contentWrapperRef}>
            {this.generateContent()}
          </ContentWrapper>
          
          <SubmitCurrencyWrapper id="destCurr" data-status={this.state.showInputCurr ? "show" : "hide"} >
            <CustomDropdown
              search
              clearable
              scrolling
              selection={exchangeRateLoaded}
              loading={exchangeRateLoading}
              placeholder={
                exchangeRateLoaded && exchangeRateData
                  ? exchangeRateData.currencyList[0].value
                  : null
              }
              options={
                exchangeRateLoaded && exchangeRateData
                  ? exchangeRateData.currencyList
                  : []
              }
              onChange={this.handleTargetCurrencyChanges}
            />
            <CustomDropdownButton
              basic color='teal'
              disabled={exchangeRateLoading}
              
              onClick={this.submitCurrency}
            >
              {intl.formatMessage({ id: 'general.submit' })}
            </CustomDropdownButton>
          </SubmitCurrencyWrapper>
          

          <ButtonAddWrapper id="addCurr" data-status={this.state.showAddCurr ? "show" : "hide"} onClick={() => this.handleOpenCurrInput(destCurr)}>
            <button className="ui fluid button">
              {intl.formatMessage({ id: 'general.add.currency' })}
            </button>
          </ButtonAddWrapper>


        <GlobalStyle />
      </AppWrapper>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadExchangeRate: query => dispatch(loadExchangeRate(query)),
  };
}

const mapStateToProps = createStructuredSelector({
  exchangeRateData: makeSelectExchangeRateData(),
  exchangeRateLoading: makeSelectExchangeRateLoading(),
  exchangeRateLoaded: makeSelectExchangeRateLoaded(),
  exchangeRateError: makeSelectExchangeRateError(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);
const withSaga = injectSaga({ key: 'global', saga });

App.propTypes = {
  exchangeRateData: PropTypes.object,
  exchangeRateLoading: PropTypes.bool,
  exchangeRateLoaded: PropTypes.bool,
  intl: intlShape.isRequired,
  loadExchangeRate: PropTypes.func,
};
export default compose(
  withConnect,
  withSaga,
)(injectIntl(App));
